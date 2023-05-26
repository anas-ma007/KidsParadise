const user_helpers = require('../helpers/user_helpers')
// const { request, response } = require('express')
const productHelpers = require("../helpers/product_helpers")
const admin_helpers = require('../helpers/admin_helpers')
const cartHelpers = require("../helpers/cart_helpers")
const twilioApi = require("../twilio")
// const { ReferSip } = require('twilio/lib/twiml/VoiceResponse')

module.exports = {
    user_homepage: async (req, res) => {
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
    },

    user_login: function (req, res) {

        if (req.session.loggedIn) {
            res.redirect("/")
        } else {
            res.render('user_view/user_login', { "loginErr": req.session.loginErr, layout: 'user_LogLayout' })
            req.session.loginErr = false;
        }
    },

    user_signup: function (req, res) {
        // console.log("success user signup");
        res.render('user_view/user_signup', { layout: 'user_LogLayout', message: '' })
    },

    user_signupPost: (req, res) => {
        user_helpers.doSignup(req.body).then((response) => {
            if (response.status) {
                // console.log("logg in if ", response.status, );
                req.session.user = response.userData;
                req.session.loggedIn = true;
                res.redirect("/");
            } else {
                // console.log("logg in else ", response.status, );
                res.render('user_view/user_signup', { layout: 'user_LogLayout', message: response.message })
            }
        });
    },

    user_loginPost: function (req, res) {
        // console.log("lllllllllllllllllllll", req.body);
        user_helpers.doLogin(req.body).then((response) => {
            if (response.status) {
                req.session.loggedIn = true
                req.session.user = response.user
                // console.log(req.session.loggedIn);
                res.redirect("/");
            } else {
                console.log(response.status, response.message);
                req.session.loginErr = response.message;
                res.redirect("/login");
            }
        })
    },



    viewProducts: async (req, res) => {

        var user = req.session.user
        // console.log(category);
        try {
            var cartCount = await productHelpers.getCartCount(user._id)
            var page = parseInt(req.query.page) || 1;
            var pageSize = parseInt(req.query.pageSize) || 12;
            var skip = (page - 1) * pageSize;
            var filter = req.query.filter
            // console.log(filter);

            if (filter) {
                var category = await productHelpers.getCategory()
                // console.log(category, "category filter")

                var cartCount = await productHelpers.getCartCount(user._id)
                // var allProdcuts=await productHelpers.allproducts(filter)
                let products = await productHelpers.filterGetProducts(skip, pageSize, filter)
                var count = await productHelpers.userProductCount()
                // console.log(count);
                var totalPages = Math.ceil(count / pageSize);
                var currentPage = page > totalPages ? totalPages : page;
                // console.log("from try block", currentPage);
                res.render("user_view/all_products", {
                    user,
                    products,
                    totalPages,
                    currentPage,
                    pageSize,
                    category,
                    cartCount
                });

            } else {

                var products = await productHelpers.userGetProducts(skip, pageSize)
                var cartCount = await productHelpers.getCartCount(user._id)
                var category = await productHelpers.getCategory()
                // console.log(category, "category else")
                // ReferSip
                // console.log(products,"joyelll");
                var count = await productHelpers.userProductCount()
                // console.log(count);
                var totalPages = Math.ceil(count / pageSize);
                var currentPage = page > totalPages ? totalPages : page;
                // console.log("from try block", currentPage);
                res.render("user_view/all_products", {
                    user,
                    products,
                    totalPages,
                    currentPage,
                    pageSize,
                    category,
                    cartCount
                });
            }


        } catch (err) {
            let cartCount
            var page = parseInt(req.query.page) || 1;
            var pageSize = parseInt(req.query.pageSize) || 12;
            var count = await productHelpers.userProductCount()
            var category = await productHelpers.getCategory()
            // console.log(category, "category catch")
            var skip = (page - 1) * pageSize;
            var totalPages = Math.ceil(count / pageSize);
            var currentPage = page > totalPages ? totalPages : page;
            // console.log(skip, pageSize);
            var products = await productHelpers.userGetProducts(skip, pageSize)
            // console.log("from catch block", products);
            res.render("user_view/all_products", {
                products,
                totalPages,
                currentPage,
                pageSize,
                category,
            });
        }

        // productHelpers.getProducts().then((products) => {
        //     if (req.session.user) {
        //         res.render("user_view/all_products", { user, products })
        //     } else {
        //         res.render("user_view/all_products", { products })
        //     }
        // })

    },



    logout: (req, res) => {
        req.session.destroy();
        res.redirect("/")
    },

    userViewSingleProduct: async (req, res) => {
        let cartCount = await productHelpers.getCartCount(user._id)
        let user = req.session.loggedIn
        let product = await admin_helpers.getOneProduct(req.params.id)


        if (req.session.userLoggedIn) {
            res.render('user/productdetails', { user, product, cartCount });

        } else {
            res.render('user/productdetails', { product });

        }
    },

    otplogin: (req, res) => {
        if (req.session.loggedIn) {
            res.redirect('/');
        } else {
            res.render("user_view/otp_login", { layout: 'user_LogLayout', "loginErr": req.session.otpErr, });
            req.session.otpErr = false;
        }


    },
    sendotp: (req, res) => {
        let phone = req.body.phone
        console.log(req.body);
        console.log("apuc,apciasdhcuoabljsdfv68tr08yerhbvananaanbabnabab   anas");
        user_helpers.checkUserOTP(req.body).then(async (userData) => {
            if (userData) {
                user_helpers.doSendOtp(req.body).then((response) => {
                    if (response) {
                        console.log(response);
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

    },



    verifyOtp: (req, res) => {
        console.log(req.body, "otp verifyyyyyyyy req. body");
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
    },
    productDetails: async (req, res) => {

        let user = req.session.user
        if (user) {
            let products = await cartHelpers.getCartProducts(user._id)
            // console.log(products, products.productsDetails[0],  "products adn products qurnaty check for single product");

            let cartCount = await productHelpers.getCartCount(user._id)
            await productHelpers.getProductDetails(req.params.id).then((product) => {
                console.log(product.reviews, "product reviews produtc page");
                let reviews = product.reviews
                if (req.session.user) {
                    res.render('user_view/product_details', { product, user, cartCount,reviews })
                }
            })
        } else {
            productHelpers.getProductDetails(req.params.id).then((product) => {
                let reviews = product.reviews
                res.render('user_view/product_details', { product,reviews })
            })
        }

    },

    addToCart: async (req, res) => {
        let userId = req.session.user._id
        let proId = req.params.id
        console.log("api call");
        cartHelpers.doAddToCart(proId, userId).then(() => {
            // console.log("addeddddd to cart......");
            // res.redirect("back")
            res.json({ status: true })
        })
    },

    shoppingCart: async (req, res) => {
        console.log("trrrrrrrrrrrrrrrrrrrrrrrrr");
        let user = req.session.user
        let userId = req.session.user._id
        let cartCount = await productHelpers.getCartCount(user._id)
        let products = await cartHelpers.getCartProducts(userId)

        let grandTotal = (await user_helpers.getTotalAmount(userId))
        const offerTotal = await user_helpers.getOfferAmount(userId);
        // let Total=grandTotal[0].total-offerTotal[0].total
        // console.log(grandTotal.total, "grnd 0 total ");
        // console.log([products, 'hhhhh']);
        res.render("user_view/shopping_cart", { products, user, cartCount, grandTotal, offerTotal })
    },



    search: async (req, res) => {
        const searchValue = req.query.search;
        // let cartCount = 0;
        // let wishlistCount = 0;
        // if(req.session.loggedIn) {
        let user = req.session.user;
        // cartCount = await userHelpers.getCartCountNew(req.session.user._id);
        // req.session.cartCount = parseInt(cartCount);
        // wishlistCount = await userHelpers.wishlistCount(req.session.user._id);
        // req.session.wishlistCount = parseInt(wishlistCount);
        // productHelpers.doSearch({ search: searchValue }).then((products) => {
        // if (products.length > 0) {
        //   res.render('user/shop', {admin:false,userHeader:true,products,user,cartCount,wishlistCount})
        // res.render("user_view/all_products", { user, products, });
        //         } else {
        //           res.json({
        //             status: 'error',
        //             message: 'No matching products found'
        //           });
        //         }
        //       }).catch((err) => {
        //         res.json({
        //           status: 'error',
        //           message: err.message
        //         });
        //       });
        // }else{

        productHelpers.doSearch({ search: searchValue }).then((products) => {
            if (products.length > 0) {
                res.render("user_view/all_products", { user, products, });

            } else {
                res.json({
                    status: 'error',
                    message: 'No matching products found'
                });
            }
        }).catch((err) => {
            res.json({
                status: 'error',
                message: err.message
            });
        });

    },


    ///forgot password /////
    getForgotPassword: (req, res) => {
        res.render('user_view/forgot_password', { layout: 'user_LogLayout' });
        // req.session.user=false;
    },
    forgotPasswordOtp: (req, res) => {
        req.session.mobile = req.body.mobile;
        console.log("sesion mobile: ", req.session.mobile)
        user_helpers.checkForUser(req.body.mobile).then(async (user) => {
            console.log("user exist : ", user);
            if (user) {
                req.session.user = user;
                await twilioApi.sendOtpForForgotPass(req.body.mobile);
                res.json(true);
                //res.render('user_view/forgot_password', { user,  layout: 'user_LogLayout'  })
            } else {
                // req.session.user = null;
                req.session.otpLoginErr = "The phone number is not registerd with any account";
                res.json(false);
            }

        })

    },
    forgotPasswordVerify: (req, res) => {
        console.log("modile: ", req.session.mobile);
        twilioApi.verifyOtpForForgotPass(req.session.mobile, req.body.otp).then((result) => {
            if (result === "approved") {
                req.session.loggedIn = true;
                // req.session.user = response.user
                res.json({ status: true })

            }
            else {
                res.json({ status: false })
            }
        })
    },
    newPasswordUpdate: (req, res) => {
        res.render('user/forgotSetNewPassword', { admin: false, userHeader: true })
    },
    newPasswordUpdatePost: async (req, res) => {
        password = await user_helpers.newPasswordUpdate(req.session.user._id, req.body);
        req.session.destroy();
        res.redirect('/login');
    },
    renderResetPass: (req, res) => {
        res.render('user_view/reset_password', { layout: 'user_LogLayout' })
    },
    setNewPass: (req, res) => {
        const newPass = req.body.newPassword;
        const user = req.session.user;
        // console.log("last round", user);
        req.session.user = user;
        user_helpers.setNewPass(user._id, newPass).then(() => {
            req.session.loggedIn = true;
            req.session.user = user;
            res.redirect('/');
        })
            .catch((err) => {
                console.log(err);
                res.redirect('/');
            })
    },
    /////forgot password////////////



    postSearch: async (req, res) => {
        console.log(req.body);
        var user = req.session.user
        var searchkey = req.body.search
        var page = parseInt(req.query.page) || 1;
        var pageSize = parseInt(req.query.pageSize) || 12;
        var skip = (page - 1) * pageSize;
        var filter = req.query.filter
        // console.log(filter);
        var products = await productHelpers.findAllSearchProduct(skip, pageSize, searchkey)
        var category = await productHelpers.getCategory()
        // console.log(products,"joyelll");
        var count = await productHelpers.userProductCount()
        // console.log(count);
        var totalPages = Math.ceil(count / pageSize);
        var currentPage = page > totalPages ? totalPages : page;
        // console.log("from try block", currentPage);
        res.render("user_view/all_products", {
            user,
            products,
            totalPages,
            currentPage,
            pageSize,
            category

        });
    },


    changeProQuantity: (req, res) => {
        const userId = req.session.user._id;
        cartHelpers.changeProductQuantity(req.body).then(async (response) => {
            const grandTotal = await user_helpers.getTotalAmount(userId);
            const offerTotal = await user_helpers.getOfferAmount(userId);
            response.grandTotal = grandTotal[0].total - offerTotal[0].total
            res.json({
                response
            })
        })
    },

    removeCartProduct: (req, res) => {
        // console.log("40987656-0987656987657890-@#$%^&*()_)(*&^%$")
        // console.log(req.body,"rmv ordtct");
        cartHelpers.removeProductCart(req.body).then((response) => {
            // console.log("deleted product    ")
            // console.log(response);
            res.json(response)
        })
    },


    orderPlaced: async (req, res) => {
        let user = req.session.user
        let userId = req.session.user._id
        let cartCount = await productHelpers.getCartCount(user._id)
        let products = await cartHelpers.getCartProducts(userId)
        let grandTotal = await user_helpers.getTotalAmount(userId)
        let offerTotal = await user_helpers.getOfferAmount(userId);
        let userData = await user_helpers.getUser(userId)
        // let Total=grandTotal[0].total-offerTotal[0].total

        console.log("in check out page for orderplaced", "total", products, "products", cartCount, "cartcount", userId, "userid", user, "in check out page for orderplaced");

        res.render("user_view/checkout", { user, cartCount, products, grandTotal, offerTotal, userData })


    },

    addAddressPost:async (req, res) => {
        // console.log(req.body, "soorajjjj");
        try {
           await user_helpers.updateAddress(req.body, req.session.user._id);
            await user_helpers.findUserId(req.session.user._id).then((user) => {
                req.session.user = user;
                res.redirect("/orderplaced");
            });
        } catch (error) {
            console.log(error);
            render(error)
        }
    },
    addAddressPost2:async (req, res) => {
        // console.log(req.body, "soorajjjj");
        try {
            await user_helpers.updateAddress(req.body, req.session.user._id);
           await  user_helpers.findUserId(req.session.user._id).then((user) => {
                req.session.user = user;
                res.redirect("/manageAddress");
            });
        } catch (error) {
            console.log(error);
            render(error)
        }
    },


    placeOrderPost: async (req, res) => {
        console.log(req.body.addressId, "req.body.addressId");
        let user = req.session.user
        let address = await user_helpers.getUserAddress(req.session.user._id, req.body.addressId);
        let payment = req.body.paymentMethod;
        // console.log(payment,'pppppppppaaaaaaaaaaaaaaaaaaaaaaaayyyyyyyyyy');
        let products = await user_helpers.getCartList(req.session.user._id);
        let grandTotal = await user_helpers.getTotalAmount(req.session.user._id);
        let offerTotal = await user_helpers.getOfferAmount(req.session.user._id);
        console.log(grandTotal[0].total, "total andTotal[0].tota");
        console.log(offerTotal[0].total, "offer Total price in place order");
        let coupon = req.body.coupon
        let total, discount;
        if (coupon) {
            let checkCoupon = await user_helpers.getCoupon(coupon)
            discount = parseInt(checkCoupon[0].discount)
            console.log(discount, grandTotal[0].total, "discount, grandTotal[0].total ,");
            total = (grandTotal[0].total - offerTotal[0].total) - discount
        } else {
            total = grandTotal[0].total - offerTotal[0].total
            discount = 0
        }
        // console.log(total, "total log");
        // console.log(products, "products,======", discount," discounttttt");
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
                    console.log("log in order before razrpay methd");
                    console.log(orderId, total);
                    user_helpers.generateRazorpay(orderId, total).then((response) => {
                        console.log(products, "products in online payment");
                        console.log(response, "response after razorpay");
                        user_helpers.stockDecrement(products)
                        res.json(response);
                    });
                }
            });
    },
    viewOrders: async (req, res) => {
        let user = req.session.user
        let cartCount = await productHelpers.getCartCount(user._id)
        let orders = await productHelpers.getOrderDetails(req.session.user._id);
        // console.log(orders, "ttoal priced obj");
        res.render("user_view/orders", { user, cartCount, orders })
    },


    orderDetails: async (req, res) => {
        console.log(req.body);
        let user = req.session.user
        let cartCount = await productHelpers.getCartCount(user._id)
        let products = await productHelpers.orderProductDetail(req.params.id);
        let order = await productHelpers.findOrder(req.params.id);
        console.log(order, "orderssssss from control page");
        console.log(products, "products in console");
        // let orders = await productHelpers.getOrderDetails(req.session.user._id);
        res.render("user_view/order_details", { user, cartCount, products, order })
    },


    returnOrder: async (req, res) => {
        let orderId = req.params.id;
        await productHelpers.returnProduct(orderId).then(() => {
            res.redirect("/orders");
        });
    },

    cancelOrder: async (req, res) => {
        try {
            let orderId = req.params.id;
            let totalAmount = await user_helpers.totalAmount(orderId)
            let userId = await user_helpers.orderUser(orderId)
            let orders = await productHelpers.findOrder(orderId)
            await productHelpers.cancelOrder(orderId).then(async () => {
                await user_helpers.incWallet(userId, totalAmount)
                console.log("before incermnt stock functions");
                await user_helpers.incrementStock(orders[0].products).then(() => {
                    console.log("after incermnt stock functions");
                    res.redirect("/orders");
                })
            });
        } catch (error) {
            // Handle the error here
            console.error("Error occurred:", error);
            res.status(500).json({ error: "An error occurred while canceling the order." });
        }
    },



    razorpayPayment: (req, res) => {
        console.log(req.body, "req.body in razoerpaymnt");
        user_helpers.verifyPayment(req.body).then(() => {
            user_helpers.changePaymentStatus(req.body['order[receipt]']).then(() => {

                res.json({ status: true })
            })
        }).catch((err) => {
            console.log(err, "errrooroor");
            res.json({ status: false })
        })
    },


    getuserprofile: async (req, res) => {
        try {
            const userId = req.session.user._id
            const user = req.session.user
            const userDetails = await user_helpers.GetUserDetails(userId)
            // let cartcount = null;
            const cartCount = await productHelpers.getCartCount(user._id)
            res.render('user_view/userProfile', { user, cartCount, userDetails })

        } catch (error) {
            console.log(error);
            next(error)
        }
    },


    editprofileinfo: (req, res) => {
        try {
            const userId = req.params.id;
            console.log(userId, "user id in edit profile info");
            user_helpers.UpdateProfileInfo(userId, req.body).then((response) => {
                res.redirect('/userprofile/:id')
            })
        }
        catch (error) {
            console.log(error);
            res.redirect('/userprofile/:id')
        }
    },


    getAddress: async (req, res) => {
        let user = req.session.user;
        const userId = req.session.user._id;
        const userDetails = await user_helpers.GetUserDetails(userId)
        let address = await user_helpers.findUser(userId);
        const cartCount = await productHelpers.getCartCount(user._id)
        res.render('user_view/manageAddress', { user, cartCount, address, userDetails })

    },

    removeAddress: (req, res) => {
        console.log(req.params.id, "addresssssss iddddddddddddddddddd");
        let addressId = req.params.id
        let userId = req.session.user._id
        console.log(userId);
        user_helpers.removeAddress(addressId, userId).then(() => {
            res.json({ status: true })
        })

    },

    applyCoupon: async (req, res) => {
        console.log(req.body, "req bodyyyyy");
        let couponCode = req.body.couponCode
        let userId = req.session.user._id
        let grandTotal = await user_helpers.getTotalAmount(req.session.user._id);
        // let total = grandTotal[0].total
        console.log(couponCode, userId, "couponCode,userId , in apply coupon ");
        let discount = await user_helpers.doapplyCoupon(couponCode, userId)
        console.log(discount, "discount from apply coupon user cntrlr");
        if (discount) {
            let total = grandTotal[0].total - discount.discount
            console.log(total, discount.discount, "total after apply the offer");
            res.json({ status: true, total, discount: discount.discount })
        } else {
            total = grandTotal[0].total
            discount = 0;
            res.json({ status: false, total, discount })
        }
    },


    getWallet: async (req, res) => {
        let user = req.session.user;
        const userId = req.session.user._id;
        const userDetails = await user_helpers.GetUserDetails(userId)
        let address = await user_helpers.findUser(userId);
        // req.session.user = user;
        const cartCount = await productHelpers.getCartCount(user._id)
        // console.log(address, "address in user profile");
        res.render('user_view/wallet', { user, cartCount, address, userDetails })

    },

    // walletHistory : async(req, res)=>{
    //     let user = req.session.user
    //     let cartCount = await productHelpers.getCartCount(user._id)
    //     let orders = await productHelpers.getOrderDetails(req.session.user._id);
    //     // console.log(orders, "orders for wallet history");

    //     let walletOrders = [];
    //     for (let i = 0; i < orders.length; i++) {
    //       let order = orders[i];
    //       if (
    //         (order.paymentmethod === 'Cash on delivery' && order.orderstatus === "order returned") ||
    //         (order.paymentmethod === 'Razorpay'&& (order.orderstatus === "order returned" || order.orderstatus === "order cancelled") ) || 
    //         (order.paymentmethod === 'Wallet' && (order.orderstatus === "order returned" || order.orderstatus === "order cancelled")) ||
    //         (order.paymentmethod === 'Wallet')

    //       ) {
    //         walletOrders.push(order);
    //       }
    //     }

    //     // console.log(walletOrders, "walletOrders from wallet history controller functions");

    //     res.render("user_view/wallet_history", {user, cartCount, walletOrders})

    // },

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
            // Handle the error here
            console.error(error);
            res.render("error", { error });
        }
    },

    reviewPost :async (req, res)=>{
        let userName = req.session.user.name
        let review=req.body
        let proId=req.params
        console.log(review.length, "lengthhhhhhh");
      
        await productHelpers.doReviewPost(review, proId, userName)
        res.redirect("back")
        
        
    
        

    },







}
