const db = require('../config/connection')
const collection = require('../config/collections')
const user_helpers = require('../helpers/user_helpers')
// const { request, response } = require('express')
const productHelpers = require("../helpers/product_helpers")
const admin_helpers = require('../helpers/admin_helpers')
const cartHelpers = require("../helpers/cart_helpers")

module.exports = {
    user_homepage: (req, res) => {
        if (req.session.loggedIn) {
            const user = req.session.user;

            if (user) {
                // console.log('anas user check', user);
                res.render('user_view/index', { user });
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

            res.render('user_view/user_login', { "loginErr": req.session.loginErr })
            req.session.loginErr = null
        }
    },

    user_signup: function (req, res) {
        res.render('user_view/user_signup')
    },

    user_signupPost: (req, res) => {
        user_helpers.doSignup(req.body).then((response) => {
            console.log(response);


            res.redirect('/')
        })
    },

    user_loginPost: function (req, res) {
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

            var products = await productHelpers.userGetProducts(skip, pageSize)

            var count = await productHelpers.userProductCount()

            var totalPages = Math.ceil(count / pageSize);
            var currentPage = page > totalPages ? totalPages : page;
            console.log("from try block");
            res.render("user_view/all_products", {
                user,
                products,
                totalPages,
                currentPage,
                pageSize,
            });
        } catch (err) {
            console.log("from catch block");
            res.render("user_view/all_products", {
                products,
                totalPages,
                currentPage,
                pageSize,
                user
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
        res.render("user_view/otp_login")

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

    shoppingCart:async (req, res)=>{
        let user=req.session.user
        let userId=req.session.user._id
        let products=await cartHelpers.getCartProducts(userId)
        // console.log(products);
            res.render("user_view/shopping_cart", {products, user}) 
    
    },








}
