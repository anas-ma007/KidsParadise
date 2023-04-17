const user_helpers = require('../helpers/user_helpers')
// const { request, response } = require('express')
const productHelpers = require("../helpers/product_helpers")
const admin_helpers = require('../helpers/admin_helpers')
const cartHelpers = require("../helpers/cart_helpers")
const twilioApi = require("../twilio")

module.exports = {
    user_homepage: (req, res) => {
        if (req.session.loggedIn) {
            const user = req.session.user;

            if (user) {
                // console.log('anas user check', user);
                res.render('user_view/index', { user, layout: 'user_LogLayout' });
            } else {
                res.render('user_view/index', { layout: 'user_LogLayout' })
            }
        } else {
            res.render('user_view/index', { layout: 'user_LogLayout' })
        }
    },

    user_login: function (req, res) {

        if (req.session.loggedIn) {
            res.redirect("/")
        } else {

            res.render('user_view/user_login', { "loginErr": req.session.loginErr, layout: 'user_LogLayout' })
            req.session.loginErr = null
        }
    },

    user_signup: function (req, res) {
        res.render('user_view/user_signup', { layout: 'user_LogLayout' })
    },

    user_signupPost: (req, res) => {
        user_helpers.doSignup(req.body).then((response) => {
            console.log(response);


            res.redirect('/')
        })
    },

    user_loginPost: function (req, res) {
        console.log("lllllllllllllllllllll", req.body);
        user_helpers.doLogin(req.body).then((response) => {
            if (response.status) {
                req.session.loggedIn = true
                req.session.user = response.user
                // console.log(req.session.loggedIn);
                res.redirect("/")
            } else {
                req.session.loginErr = true
                res.redirect("/login")
            }
        })
    },

    viewProducts: async (req, res) => {

        var user = req.session.user
        try {
            var page = parseInt(req.query.page) || 1;
            var pageSize = parseInt(req.query.pageSize) || 8;
            var skip = (page - 1) * pageSize;
            var filter = req.query.filter
            console.log(filter);

            if(filter){

                // var allProdcuts=await productHelpers.allproducts(filter)
                var products = await productHelpers.filterGetProducts(skip, pageSize,filter)
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

            }else{

                var products = await productHelpers.userGetProducts(skip, pageSize)
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

            }

           
        } catch (err) {
            console.log("from catch block");
            res.render("user_view/all_products", {
                products,
                totalPages,
                currentPage,
                pageSize
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
        let user = req.session.loggedIn
        let product = await admin_helpers.getOneProduct(req.params.id)
        // console.log(product.image)

        if (req.session.userLoggedIn) {
            // cartcount = await productHelpers.getCartCount(user._id)

            res.render('user/productdetails', { user, product });
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
    productDetails: (req, res) => {
        let user = req.session.user
        productHelpers.getProductDetails(req.params.id).then((product) => {
            console.log(product);
            if (req.session.user) {
                res.render('user_view/product_details', { user, product })
            } else {
                res.render('user_view/product_details', { product })
            }
        })
    },

    addToCart: async (req, res) => {
        let userId = req.session.user._id
        let proId = req.params.id
        cartHelpers.doAddToCart(proId, userId).then(() => {
            // console.log("addeddddd to cart......");
            res.redirect("back")

        })
    },

    shoppingCart: async (req, res) => {
        let user = req.session.user
        let userId = req.session.user._id
        let products = await cartHelpers.getCartProducts(userId)
        // console.log(products);
        res.render("user_view/shopping_cart", { products, user })

    },



    // searchProducts: async (req, res) => {
    //     let name=req.body.search
    //     console.log(name);
    //     var user = req.session.user
    //     try {
    //         var page = parseInt(req.query.page) || 1;
    //         var pageSize = parseInt(req.query.pageSize) || 8;
    //         var skip = (page - 1) * pageSize;

    //         var products = await productHelpers.searchProducts(name)
    //         console.log(products,"vijay annaaan products");
    //         var count = await productHelpers.userProductCount()

    //         var totalPages = Math.ceil(count / pageSize);
    //         var currentPage = page > totalPages ? totalPages : page;
    //         console.log("from try block");
    //         res.render("user_view/all_products", {
    //             user,
    //             products,
    //             totalPages,
    //             currentPage,
    //             pageSize,
    //         });
    //     } catch (err) {
    //         console.log("from catch block");
    //         res.render("user_view/all_products", {
    //             products,
    //             totalPages,
    //             currentPage,
    //             pageSize,
    //             user
    //         });
    //     }

    // productHelpers.getProducts().then((products) => {
    //     if (req.session.user) {
    //         res.render("user_view/all_products", { user, products })
    //     } else {
    //         res.render("user_view/all_products", { products })

    //     }
    // })

    // },


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
        user_helpers.checkForUser(req.body.mobile).then(async (user) => {
            if (user) {
                req.session.user = user;


                
                await twilioApi.sendOtpForForgotPass(req.body.mobile);
                // res.json(true)
                res.render('user_view/forgot_password', { user,  layout: 'user_LogLayout'  })
            } else {
                req.session.user = null;
                req.session.otpLoginErr = "The phone number is not registerd with any account";
                res.json(false);
            }

        })

    },


    forgotPasswordVerify: (req, res) => {
        twilioApi.verifyOtpForForgotPass(req.session.mobile, req.body.otp).then((result) => {
            if (result === "approved") {
                req.session.loggedIn = true;
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


    /////forgot password////////////



    // filterProducts: async (req, res) => {

    //     var user = req.session.user
    //     try {
    //         var page = parseInt(req.query.page) || 1;
    //         var pageSize = parseInt(req.query.pageSize) || 8;
    //         var skip = (page - 1) * pageSize;

    //         var products = await productHelpers.filterGetProducts(skip, pageSize)
    //         // console.log(products,"joyelll");
    //         var count = await productHelpers.userProductCount()
    //         // console.log(count);
    //         var totalPages = Math.ceil(count / pageSize);
    //         var currentPage = page > totalPages ? totalPages : page;
    //         console.log("from try block", currentPage);
    //         res.render("user_view/all_products", {
    //             user,
    //             products,
    //             totalPages,
    //             currentPage,
    //             pageSize,
    //         });
    //     } catch (err) {
    //         console.log("from catch block");
    //         res.render("user_view/all_products", {
    //             products,
    //             totalPages,
    //             currentPage,
    //             pageSize
    //         });
    //     }


    // },

    postSearch : async (req, res)=>{
        console.log(req.body);
        var user = req.session.user
        var searchkey = req.body.search
        var page = parseInt(req.query.page) || 1;
            var pageSize = parseInt(req.query.pageSize) || 8;
            var skip = (page - 1) * pageSize;
            var filter = req.query.filter
            console.log(filter);
        var products = await productHelpers.findAllSearchProduct(skip, pageSize,searchkey)
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









}
