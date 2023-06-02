var express = require('express');
var router = express.Router();
const usercontrollers = require('../controllers/user_controllers')
const multer =require("../utils/multer");
const middlewares = require('../middlewares/middlewares');

/* GET users listing. */

// HOMEPAGE 
router.get('/', usercontrollers.user_homepage)

// USER SIGNIN & SINGNUP
router.get('/signup', usercontrollers.user_signup)
router.post('/signup', usercontrollers.user_signupPost)
router.get('/login', usercontrollers.user_login)
router.post('/login', usercontrollers.user_loginPost)
router.get("/logout", usercontrollers.logout)

// PRODUCTS 
router.get("/allproducts", usercontrollers.viewProducts)
router.get("/productdetails/:id", usercontrollers.productDetails)

// OTP LOGIN 
router.get("/otplogin", usercontrollers.otplogin)
router.post('/send-otp', usercontrollers.sendotp)
router.post("/otp-verify", usercontrollers.verifyOtp)

// USER CART MANAGEMENT
router.get("/addtocart/:id", middlewares.checkUserLoggedIn, usercontrollers.addToCart )
router.get("/cart", middlewares.checkUserLoggedIn, usercontrollers.shoppingCart)
router.post('/change-product-quantity',middlewares.checkUserLoggedIn, usercontrollers.changeProQuantity)
router.post('/remove-product',middlewares.checkUserLoggedIn, usercontrollers.removeCartProduct);

// USER ORDER MANAGEMENT 
router.get("/orderplaced", middlewares.checkUserLoggedIn, usercontrollers.orderPlaced)
router.post('/place-order',middlewares.checkUserLoggedIn, usercontrollers.placeOrderPost)
router.post('/verify-payment',middlewares.checkUserLoggedIn, usercontrollers.razorpayPayment)

// USER ADDRESS MANAGEMETN
router.post('/add-address',middlewares.checkUserLoggedIn,usercontrollers.addAddressPost);
router.get("/orders", middlewares.checkUserLoggedIn, usercontrollers.viewOrders )
router.get("/order-product-details/:id",  middlewares.checkUserLoggedIn, usercontrollers.orderDetails)
router.post("/apply_coupon", middlewares.checkUserLoggedIn, usercontrollers.applyCoupon )

// USER RETURN & CACNCL
router.get('/return-order/:id',middlewares.checkUserLoggedIn, usercontrollers.returnOrder)
router.get('/cancel-order/:id',middlewares.checkUserLoggedIn, usercontrollers.cancelOrder)
router.post("/search", usercontrollers.postSearch) 

// USER FORGOT PASSWORD 
router.get('/forgotPassword', usercontrollers.getForgotPassword);
router.post('/forgotPassword-otp', usercontrollers.forgotPasswordOtp);
router.post('/forgotPassword-otpVerify', usercontrollers.forgotPasswordVerify);
router.get('/renderResetPass', usercontrollers.renderResetPass);
router.post('/setNewPassword', usercontrollers.setNewPass);

// USER PROFILE MANAGEMENT
router.get('/userprofile/:id', middlewares.checkUserLoggedIn, usercontrollers.getuserprofile)
router.get('/manageAddress', middlewares.checkUserLoggedIn, usercontrollers.getAddress);
router.post('/add-address2',middlewares.checkUserLoggedIn,usercontrollers.addAddressPost2);
router.get("/removeAddress/:id", middlewares.checkUserLoggedIn, usercontrollers.removeAddress)
router.get("/editaddress/:id"  , middlewares.checkUserLoggedIn, usercontrollers.editAddress)
router.post("/editaddress/:id", middlewares.checkUserLoggedIn, usercontrollers.editAddressPost)

// USER WALLET 
router.get("/wallet",  middlewares.checkUserLoggedIn, usercontrollers.getWallet)
router.get("/wallethistory",  middlewares.checkUserLoggedIn, usercontrollers.walletHistory)
router.get('/userprofile', middlewares.checkUserLoggedIn, usercontrollers.geteditprofileinfo)
router.post('/userprofile/:id', middlewares.checkUserLoggedIn, usercontrollers.editprofileinfo)

router.post("/review/:id", middlewares.checkUserLoggedIn, usercontrollers.reviewPost)
// router.post("/getReviewBox", middlewares.checkUserLoggedIn, usercontrollers.accessReviewBox)




module.exports = router;