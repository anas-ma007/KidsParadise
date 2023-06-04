const user_helpers = require('../helpers/user_helpers')
const productHelpers = require("../helpers/product_helpers")
const admin_helpers = require('../helpers/admin_helpers')
const cartHelpers = require("../helpers/cart_helpers")
const twilioApi = require("../twilio")

module.exports = {
    user_homepage: async (req, res) => {
        try {
            let banner = await user_helpers.getBanner()
            if (req.session.loggedIn) {
                const user = req.session.user;
                if (user) {
                    let cartCount = await productHelpers.getCartCount(user._id)
                    res.render('user_view/index', { user, cartCount, banner });
                } else {
                    res.render('user_view/index', { banner })
                }
            } else {
                res.render('user_view/index', { banner })
            }

        } catch (error) {
            res.render("error", { error });
        }
    },

    user_login: function (req, res) {


        try {
            if (req.session.loggedIn) {
                res.redirect("/")
            } else {
                res.render('user_view/user_login', { "loginErr": req.session.loginErr, layout: 'user_LogLayout' })
                req.session.loginErr = false;
            }

        } catch (error) {
            res.render("error", { error });
        }
    },

    user_signup: function (req, res) {
        try {
            res.render('user_view/user_signup', { layout: 'user_LogLayout', message: '' })

        } catch (error) {
            res.render("error", { error });
        }
    },

    user_signupPost: (req, res) => {


        try {
            user_helpers.doSignup(req.body).then((response) => {
                if (response.status) {
                    req.session.user = response.userData;
                    req.session.loggedIn = true;
                    res.redirect("/");
                } else {
                    res.render('user_view/user_signup', { layout: 'user_LogLayout', message: response.message })
                }
            });

        } catch (error) {
            res.render("error", { error });
        }
    },

    user_loginPost: function (req, res) {

        try {
            user_helpers.doLogin(req.body).then((response) => {
                if (response.status) {
                    req.session.loggedIn = true
                    req.session.user = response.user
                    res.redirect("/");
                } else {
                    req.session.loginErr = response.message;
                    res.redirect("/login");
                }
            })

        } catch (error) {
            res.render("error", { error });
        }
    },
    viewProducts: async (req, res) => {
        var user = req.session.user;
        try {
            var cartCount;
            if (user) {
                cartCount = await productHelpers.getCartCount(user._id);
            }
            var page = parseInt(req.query.page) || 1;
            var pageSize = parseInt(req.query.pageSize) || 12;
            var skip = (page - 1) * pageSize;
            var filter = req.query.filter;
            if (filter) {

                var category = await productHelpers.getCategory();
                let products = await productHelpers.filterGetProducts(skip, pageSize, filter);
                var count = await productHelpers.userProductCount(filter); // Pass the filter to count only filtered products
                var totalPages = Math.ceil(count / pageSize);
                var currentPage = page > totalPages ? totalPages : page;
                res.render("user_view/all_products", {
                    user,
                    products,
                    totalPages,
                    currentPage,
                    pageSize,
                    category,
                    cartCount,
                });
            } else {

                let cartCount = await productHelpers.getCartCount(user._id)

                var products = await productHelpers.userGetProducts(skip, pageSize);
                var category = await productHelpers.getCategory();
                var count = await productHelpers.userProductCount();
                var totalPages = Math.ceil(count / pageSize);
                var currentPage = page > totalPages ? totalPages : page;
                res.render("user_view/all_products", {
                    user,
                    products,
                    totalPages,
                    currentPage,
                    pageSize,
                    category,
                    cartCount,
                });
            }
        } catch (err) {
            var page = parseInt(req.query.page) || 1;
            var pageSize = parseInt(req.query.pageSize) || 12;
            var count = await productHelpers.userProductCount();
            var category = await productHelpers.getCategory();
            var skip = (page - 1) * pageSize;
            var totalPages = Math.ceil(count / pageSize);
            var currentPage = page > totalPages ? totalPages : page;
            var products = await productHelpers.userGetProducts(skip, pageSize);
            res.render("user_view/all_products", {
                products,
                totalPages,
                currentPage,
                pageSize,
                category,
            });
        }
    },


    logout: (req, res) => {
        try {
            req.session.destroy();
            res.redirect("/")

        } catch (error) {
            res.render("error", { error });
        }
    },

    userViewSingleProduct: async (req, res) => {
        try {
            let cartCount = await productHelpers.getCartCount(user._id)
            let user = req.session.loggedIn
            let product = await admin_helpers.getOneProduct(req.params.id)


            if (req.session.userLoggedIn) {
                res.render('user/productdetails', { user, product, cartCount });

            } else {
                res.render('user/productdetails', { product });

            }

        } catch (error) {
            res.render("error", { error });
        }
    },

    otplogin: (req, res) => {

        try {
            if (req.session.loggedIn) {
                res.redirect('/');
            } else {
                res.render("user_view/otp_login", { layout: 'user_LogLayout', "loginErr": req.session.otpErr, });
                req.session.otpErr = false;
            }

        } catch (error) {
            res.render("error", { error });
        }


    },
    sendotp: (req, res) => {
        try {
            let phone = req.body.phone
            user_helpers.checkUserOTP(req.body).then(async (userData) => {
                if (userData) {
                    user_helpers.doSendOtp(req.body).then((response) => {
                        if (response) {
                            req.session.otpphone = phone
                            res.json({
                                success: response,
                                mobile: req.body.phone
                            })
                        } else {
                            req.session.user = null;
                            req.session.otpErr = "You were blocked by admin..!!!";
                            res.json(false);
                        }
                    })
                } else {
                    req.session.user = null;
                    req.session.otpErr = "This mobile number is not registered with any account";
                    res.json(false);
                }
            })

        } catch (error) {
            res.render("error", { error });
        }

    },



    verifyOtp: (req, res) => {
        try {
            let phone = req.session.otpphone
            user_helpers.doVerifyOtp(req.body, phone).then((response) => {
                if (response.sendSms) {
                    req.session.loggedIn = true
                    req.session.user = response.user
                    res.json(response)
                } else {
                    res.json(response)
                }

            })

        } catch (error) {
            res.render("error", { error });
        }
    },
    productDetails: async (req, res) => {

        try {
            let user = req.session.user
            if (user) {
                let products = await cartHelpers.getCartProducts(user._id)
                let cartCount = await productHelpers.getCartCount(user._id)
                await productHelpers.getProductDetails(req.params.id).then((product) => {
                    let reviews = product.reviews
                    if (req.session.user) {
                        res.render('user_view/product_details', { product, user, cartCount, reviews })
                    }
                })
            } else {
                productHelpers.getProductDetails(req.params.id).then((product) => {
                    let reviews = product.reviews
                    res.render('user_view/product_details', { product, reviews })
                })
            }

        } catch (error) {
            res.render("error", { error });
        }

    },

    addToCart: async (req, res) => {
        try {
            let userId = req.session.user._id
            let proId = req.params.id
            cartHelpers.doAddToCart(proId, userId).then(() => {
                res.json({ status: true })
            })

        } catch (error) {
            res.render("error", { error });
        }
    },

    shoppingCart: async (req, res) => {
        try {
            let user = req.session.user
            let userId = req.session.user._id
            let cartCount = await productHelpers.getCartCount(user._id)
            let products = await cartHelpers.getCartProducts(userId)
            let grandTotal = (await user_helpers.getTotalAmount(userId))
            const offerTotal = await user_helpers.getOfferAmount(userId);
            res.render("user_view/shopping_cart", { products, user, cartCount, grandTotal, offerTotal })

        } catch (error) {
            res.render("error", { error });
        }
    },



    ///forgot password /////
    getForgotPassword: (req, res) => {
        try {
            res.render('user_view/forgot_password', { layout: 'user_LogLayout' });

        } catch (error) {
            res.render("error", { error });
        }
    },
    forgotPasswordOtp: (req, res) => {

        try {
            req.session.mobile = req.body.mobile;
            user_helpers.checkForUser(req.body.mobile).then(async (user) => {
                if (user) {
                    req.session.user = user;
                    await twilioApi.sendOtpForForgotPass(req.body.mobile);
                    res.json(true);
                } else {
                    req.session.otpLoginErr = "The phone number is not registerd with any account";
                    res.json(false);
                }

            })

        } catch (error) {
            res.render("error", { error });
        }

    },
    forgotPasswordVerify: (req, res) => {
        try {
            twilioApi.verifyOtpForForgotPass(req.session.mobile, req.body.otp).then((result) => {
                if (result === "approved") {
                    req.session.loggedIn = true;
                    res.json({ status: true })

                }
                else {
                    res.json({ status: false })
                }
            })

        } catch (error) {
            res.render("error", { error });
        }
    },
    newPasswordUpdate: (req, res) => {
        try {
            res.render('user/forgotSetNewPassword', { admin: false, userHeader: true })

        } catch (error) {
            res.render("error", { error });
        }
    },

    newPasswordUpdatePost: async (req, res) => {

        try {
            password = await user_helpers.newPasswordUpdate(req.session.user._id, req.body);
            req.session.destroy();
            res.redirect('/login');

        } catch (error) {
            res.render("error", { error });
        }
    },
    renderResetPass: (req, res) => {

        try {
            res.render('user_view/reset_password', { layout: 'user_LogLayout' })

        } catch (error) {
            res.render("error", { error });
        }
    },
    setNewPass: (req, res) => {
        const newPass = req.body.newPassword;
        const user = req.session.user;
        req.session.user = user;
        user_helpers.setNewPass(user._id, newPass).then(() => {
            req.session.loggedIn = true;
            req.session.user = user;
            res.redirect('/');
        })
            .catch((error) => {
                console.log(error);
                res.render("error", { error });

            })


    },

    /////forgot password////////////



    postSearch: async (req, res) => {
        try {
            let searchkey = req.body.search
            let products = await productHelpers.findAllSearchProduct(searchkey)
            let category = await productHelpers.getCategory()
            let user = req.session.user
            if (user) {
                let cartCount = await productHelpers.getCartCount(user._id)
                res.render("user_view/search", { user, products, category, cartCount });
            } else {
                res.render("user_view/search", { products, category });
            }

        } catch (error) {
            res.render("error", { error });
        }

    },


    changeProQuantity: (req, res) => {
        try {
            const userId = req.session.user._id;
            cartHelpers.changeProductQuantity(req.body).then(async (response) => {
                const grandTotal = await user_helpers.getTotalAmount(userId);
                const offerTotal = await user_helpers.getOfferAmount(userId);
                response.grandTotal = grandTotal[0].total - offerTotal[0].total
                res.json({
                    response
                })
            })

        } catch (error) {
            res.render("error", { error });
        }
    },

    removeCartProduct: (req, res) => {
        try {
            cartHelpers.removeProductCart(req.body).then((response) => {
                res.json(response)
            })

        } catch (error) {
            res.render("error", { error });
        }
    },


    orderPlaced: async (req, res) => {
        try {
            let user = req.session.user
            let userId = req.session.user._id
            let cartCount = await productHelpers.getCartCount(user._id)
            let products = await cartHelpers.getCartProducts(userId)
            let grandTotal = await user_helpers.getTotalAmount(userId)
            let offerTotal = await user_helpers.getOfferAmount(userId);
            let userData = await user_helpers.getUser(userId)
            res.render("user_view/checkout", { user, cartCount, products, grandTotal, offerTotal, userData })

        } catch (error) {
            res.render("error", { error });
        }
    },

    addAddressPost: async (req, res) => {
        try {
            await user_helpers.addNewAddress(req.body, req.session.user._id);
            await user_helpers.findUserId(req.session.user._id).then((user) => {
                req.session.user = user;
                res.redirect("/orderplaced");
            });
        } catch (error) {
            res.render("error", { error });
        }
    },
    addAddressPost2: async (req, res) => {
        try {
            await user_helpers.addNewAddress(req.body, req.session.user._id);
            await user_helpers.findUserId(req.session.user._id).then((user) => {
                req.session.user = user;
                res.redirect("/manageAddress");
            });
        } catch (error) {
            res.render("error", { error });
        }
    },


    placeOrderPost: async (req, res) => {

        try {
            let user = req.session.user
            let address = await user_helpers.getUserAddress(req.session.user._id, req.body.addressId);
            let payment = req.body.paymentMethod;
            let products = await user_helpers.getCartList(req.session.user._id);
            let grandTotal = await user_helpers.getTotalAmount(req.session.user._id);
            let offerTotal = await user_helpers.getOfferAmount(req.session.user._id);
            let coupon = req.body.coupon
            let total, discount;

            if (coupon) {
                let checkCoupon = await user_helpers.getCoupon(coupon)

                discount = parseInt(checkCoupon[0].discount)
                total = (grandTotal[0].total - offerTotal[0].total) - discount

            } else {
                total = grandTotal[0].total - offerTotal[0].total
                discount = 0
            }
            user_helpers.placeOrder(
                address,
                products,
                total,
                payment,
                req.session.user._id,
                discount
            )
                .then((orderId) => {
                    if (req.body["paymentMethod"] == "Cash on delivery") {
                        user_helpers.stockDecrement(products)
                        res.json({ codSuccess: true });
                    } else if (req.body["paymentMethod"] == "Wallet") {
                        user_helpers.stockDecrement(products)
                        user_helpers.decWallet(user._id, total)
                        res.json({ walletSuccess: true });
                    }
                    else {
                        user_helpers.generateRazorpay(orderId, total).then((response) => {
                            user_helpers.stockDecrement(products)
                            res.json(response);
                        });
                    }
                });

        } catch (error) {
            res.render("error", { error });
        }
    },
    viewOrders: async (req, res) => {

        try {
            let user = req.session.user
            let cartCount = await productHelpers.getCartCount(user._id)
            let orders = await productHelpers.getOrderDetails(req.session.user._id);
            res.render("user_view/orders", { user, cartCount, orders })

        } catch (error) {
            res.render("error", { error });
        }
    },


    orderDetails: async (req, res) => {
        try {
            let user = req.session.user
            let cartCount = await productHelpers.getCartCount(user._id)
            let products = await productHelpers.orderProductDetail(req.params.id);
            let order = await productHelpers.findOrder(req.params.id);
            res.render("user_view/order_details", { user, cartCount, products, order })

        } catch (error) {
            res.render("error", { error });
        }
    },


    returnOrder: async (req, res) => {

        try {
            let orderId = req.params.id;
            await productHelpers.returnProduct(orderId).then(() => {
                res.redirect("/orders");
            });

        } catch (error) {
            res.render("error", { error });
        }
    },

    cancelOrder: async (req, res) => {
        try {
            let orderId = req.params.id;
            let totalAmount = await user_helpers.totalAmount(orderId)
            let userId = await user_helpers.orderUser(orderId)
            let orders = await productHelpers.findOrder(orderId)
            await productHelpers.cancelOrder(orderId).then(async () => {
                if (paymentMethod == 'Razorpay' || paymentMethod == 'Wallet') {
                    await user_helpers.incWallet(userId, totalAmount)
                    await user_helpers.incrementStock(orders[0].products).then(() => {
                        res.redirect("/orders");
                    })
                } else {
                    await user_helpers.incrementStock(orders[0].products).then(() => {
                        res.redirect("/orders");
                    })

                }
            });
        } catch (error) {
            res.status(500).json({ error: "An error occurred while canceling the order." });
        }
    },



    razorpayPayment: (req, res) => {
        user_helpers.verifyPayment(req.body).then(() => {
            user_helpers.changePaymentStatus(req.body['order[receipt]']).then(() => {

                res.json({ status: true })
            })
        }).catch((error) => {
            res.json({ status: false })
        })
    },


    getuserprofile: async (req, res) => {
        try {
            const userId = req.session.user._id
            const user = req.session.user
            const userDetails = await user_helpers.GetUserDetails(userId)
            const cartCount = await productHelpers.getCartCount(user._id)
            res.render('user_view/userProfile', { user, cartCount, userDetails })

        } catch (error) {
            res.render("error", { error });
        }
    },
    geteditprofileinfo: async (req, res) => {
        const userId = req.session.user._id
        const user = req.session.user
        const userDetails = await user_helpers.GetUserDetails(userId)
        const cartCount = await productHelpers.getCartCount(user._id)
        res.render('user_view/edit_userprofile', { user, cartCount, userDetails })

    },


    editprofileinfo: (req, res) => {
        try {
            const userId = req.params.id;
            user_helpers.UpdateProfileInfo(userId, req.body).then((response) => {
                res.redirect('/userprofile/:id')
            })
        }
        catch (error) {
            res.redirect('/userprofile/:id')
        }
    },


    getAddress: async (req, res) => {
        try {
            const user = req.session.user;
            const userId = req.session.user._id;
            const userDetails = await user_helpers.GetUserDetails(userId)
            const address = await user_helpers.findUser(userId);
            const cartCount = await productHelpers.getCartCount(user._id)
            res.render('user_view/manageAddress', { user, cartCount, address, userDetails })

        } catch (error) {
            res.render("error", { error });
        }
    },

    removeAddress: (req, res) => {

        try {
            let addressId = req.params.id
            let userId = req.session.user._id
            user_helpers.removeAddress(addressId, userId).then(() => {
                res.json({ status: true })
            })

        } catch (error) {
            res.render("error", { error });
        }

    },

    applyCoupon: async (req, res) => {
        try {
            let couponCode = req.body.couponCode
            let userId = req.session.user._id
            let grandTotal = await user_helpers.getTotalAmount(req.session.user._id);
            let discount = await user_helpers.doapplyCoupon(couponCode, userId)
            if (discount) {
                let total = grandTotal[0].total - discount.discount
                res.json({ status: true, total, discount: discount.discount })
            } else {
                total = grandTotal[0].total
                discount = 0;
                res.json({ status: false, total, discount })
            }

        } catch (error) {
            res.render("error", { error });
        }
    },


    getWallet: async (req, res) => {
        try {
            let user = req.session.user;
            const userId = req.session.user._id;
            const userDetails = await user_helpers.GetUserDetails(userId)
            let address = await user_helpers.findUser(userId);
            const cartCount = await productHelpers.getCartCount(user._id)
            res.render('user_view/wallet', { user, cartCount, address, userDetails })

        } catch (error) {
            res.render("error", { error });
        }

    },



    walletHistory: async (req, res) => {
        try {
            let user = req.session.user;
            let cartCount = await productHelpers.getCartCount(user._id);
            let orders = await productHelpers.getOrderDetails(req.session.user._id);
            let walletOrders = [];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                if (
                    (order.paymentmethod === 'Cash on delivery' && order.orderstatus === "order returned") ||
                    (order.paymentmethod === 'Razorpay' && (order.orderstatus === "order returned" || order.orderstatus === "order cancelled")) ||
                    (order.paymentmethod === 'Wallet' && (order.orderstatus === "order returned" || order.orderstatus === "order cancelled")) ||
                    (order.paymentmethod === 'Wallet')

                ) {
                    walletOrders.push(order);
                }
            }
            res.render("user_view/wallet_history", { user, cartCount, walletOrders });
        } catch (error) {
            res.render("error", { error });
        }
    },

    reviewPost: async (req, res) => {
        try {
            let userName = req.session.user.name
            let review = req.body
            let proId = req.params
            await productHelpers.doReviewPost(review, proId, userName)
            res.redirect("back")

        } catch (error) {
            res.render("error", { error });
        }

    },



    editAddress: async (req, res) => {
        try {
            const addressId = req.params
            const user = req.session.user;
            const userId = user._id;
            const userAddress = await user_helpers.getUserAddress(userId, addressId)
            const cartCount = await productHelpers.getCartCount(user._id)
            res.render('user_view/edit_address', { user, cartCount, userAddress })

        }
        catch (error) {
            res.render("error", { error });
        }
    },



    editAddressPost: async (req, res) => {
        try {
            let userId = req.session.user._id
            let editAddressData = req.body
            let addressId = req.params
            await user_helpers.updateAddress(userId, editAddressData, addressId).then(() => {
                res.redirect("/manageAddress")
            })
        }
        catch (error) {
            res.render("error", { error });
        }
    },







}
