const user_helpers = require('../helpers/user_helpers')
// const { request, response } = require('express')
const productHelpers = require("../helpers/product_helpers")
const admin_helpers = require('../helpers/admin_helpers')
const cartHelpers = require("../helpers/cart_helpers")
const twilioApi = require("../twilio")
const { ReferSip } = require('twilio/lib/twiml/VoiceResponse')

module.exports = {
    user_homepage: async (req, res) => {
        if (req.session.loggedIn) {
            const user = req.session.user;
            if (user) {
                let cartCount = await productHelpers.getCartCount(user._id)
                // console.log(cartCount);
                // console.log('anas user check', user);
                // console.log('anas user id check', user._id);
                res.render('user_view/index', { user, cartCount });
            } else {
                res.render('user_view/index')
            }
        } else {
            res.render('user_view/index')
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
        res.render('user_view/user_signup', { layout: 'user_LogLayout' })
    },

    user_signupPost: (req, res) => {
        user_helpers.doSignup(req.body).then((response) => {
            res.redirect('/login')
        })
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
            console.log(filter);


            if (filter) {
                var category = await productHelpers.getCategory()
                var cartCount = await productHelpers.getCartCount(user._id)

                // var allProdcuts=await productHelpers.allproducts(filter)
                let products = await productHelpers.filterGetProducts(skip, pageSize, filter)
                var count = await productHelpers.userProductCount()
                // console.log(count);
                var totalPages = Math.ceil(count / pageSize);
                var currentPage = page > totalPages ? totalPages : page;
                console.log("from try block", currentPage);
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
                ReferSip
                // console.log(products,"joyelll");
                var count = await productHelpers.userProductCount()
                // console.log(count);
                var totalPages = Math.ceil(count / pageSize);
                var currentPage = page > totalPages ? totalPages : page;
                console.log("from try block", currentPage);
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

            var skip = (page - 1) * pageSize;
            var totalPages = Math.ceil(count / pageSize);
            var currentPage = page > totalPages ? totalPages : page;
            console.log(skip, pageSize);
            var products = await productHelpers.userGetProducts(skip, pageSize)
            console.log("from catch block", products);
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

        // console.log(product.image)

        if (req.session.userLoggedIn) {
            // cartcount = await productHelpers.getCartCount(user._id)

            res.render('user/productdetails', { user, product, cartCount });
            // res.render('user/singleProductView', { userHead: true, user, products, cartcount });

        } else {
            res.render('user/productdetails', { product });
            // res.render('user/singleProductView', { userHead: false, user, product, cartcount });
        }
    },

    otplogin: (req, res) => {
        res.render("user_view/otp_login", { layout: 'user_LogLayout' })

    },
    sendotp: (req, res) => {
        // console.log(req.body);
        let phone = req.body.phone
        user_helpers.doSendOtp(req.body).then((response) => {
            if (response) {
                req.session.otpphone = phone
                res.json(response)
            } else {
                res.json(response)
            }

        })
    },

    verifyOtp: (req, res) => {
        console.log(req.body);
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
            let cartCount = await productHelpers.getCartCount(user._id)
            productHelpers.getProductDetails(req.params.id).then((product) => {
                console.log(product);
                if (req.session.user) {
                    res.render('user_view/product_details', { product, user, cartCount })
                }
            })
        } else {
            productHelpers.getProductDetails(req.params.id).then((product) => {
                res.render('user_view/product_details', { product })
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
        let grandTotal = await user_helpers.getTotalAmount(userId)
        // console.log(grandTotal, "grand total price");
        // console.log([products, 'hhhhh']);


        res.render("user_view/shopping_cart", { products, user, cartCount, grandTotal })

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
        console.log("last round", user);
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
        var pageSize = parseInt(req.query.pageSize) || 8;
        var skip = (page - 1) * pageSize;
        var filter = req.query.filter
        console.log(filter);
        var products = await productHelpers.findAllSearchProduct(skip, pageSize, searchkey)
        // console.log(products,"joyelll");
        var count = await productHelpers.userProductCount()
        // console.log(count);
        var totalPages = Math.ceil(count / pageSize);
        var currentPage = page > totalPages ? totalPages : page;
        console.log("from try block", currentPage);
        res.render("user_view/all_products", {
            user,
            products,
            totalPages,
            currentPage,
            pageSize,
        });


    },


    changeProQuantity: (req, res) => {
        cartHelpers.changeProductQuantity(req.body).then((response) => {
            res.json({
                response
            })
        })
    },

    removeCartProduct: (req, res) => {
        // console.log("40987656-0987656987657890-@#$%^&*()_)(*&^%$")
        // console.log(req.body,"rmv ordtct");
        cartHelpers.removeProductCart(req.body).then((response) => {
            console.log("deleted product    ")
            console.log(response);
            res.json(response)
        })
    },


    orderPlaced: async (req, res) => {
        let user = req.session.user
        let userId = req.session.user._id
        let cartCount = await productHelpers.getCartCount(user._id)
        let products = await cartHelpers.getCartProducts(userId)
        let grandTotal = await user_helpers.getTotalAmount(userId)

        console.log(grandTotal, "total", products, "products", cartCount, "cartcount", userId, "userid", user, "user");

        res.render("user_view/checkout", { user, grandTotal, cartCount, products })


    },

    addAddressPost: (req, res) => {
        console.log(req.body, "soorajjjj");
        try {
            user_helpers.updateAddress(req.body, req.session.user._id);
            user_helpers.findUserId(req.session.user._id).then((user) => {
                req.session.user = user;
                res.redirect("/orderplaced");
            });
        } catch (error) {
            console.log(error);
        }
    },


    placeOrderPost: async (req, res) => {
        const address = await user_helpers.getUserAddress(req.session.user._id, req.body.addressId);
        let payment = req.body.paymentMethod;
        let products = await user_helpers.getCartList(req.session.user._id);
        let grandTotal = await user_helpers.getTotalAmount(req.session.user._id);
        console.log(grandTotal);
        user_helpers.placeOrder(
            address,
            products,
            grandTotal,
            payment,
            req.session.user._id,
        )
            .then((orderId) => {
                if (req.body["paymentMethod"] == "Cash on delivery") {
                    res.json({ codSuccess: true });
                }
                // else {
                //     user_helpers
                //     .generateRazorpay(orderId, grandTotal)
                //     .then((response) => {
                //       res.json(response);
                //     });
                // }
            });
    },
    viewOrders: async (req, res) => {
        let user = req.session.user
        let cartCount = await productHelpers.getCartCount(user._id)
        let orders = await productHelpers.getOrderDetails(req.session.user._id);
        res.render("user_view/orders", {user, cartCount, orders})
    }




}
