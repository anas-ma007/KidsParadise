var express = require('express');
var router = express.Router();
const usercontrollers = require('../controllers/user_controllers')
const multer =require("../utils/multer");
const middlewares = require('../middlewares/middlewares');

/* GET users listing. */

router.get('/', usercontrollers.user_homepage)

router.get('/login', usercontrollers.user_login)
router.post('/login', usercontrollers.user_loginPost)

router.get('/signup', usercontrollers.user_signup)
router.post('/signup', usercontrollers.user_signupPost)

router.get("/logout", usercontrollers.logout)

router.get("/allproducts", usercontrollers.viewProducts)

router.get("/productdetails/:id", usercontrollers.productDetails)

router.get("/otplogin", usercontrollers.otplogin)
router.post('/send-otp', usercontrollers.sendotp)
router.post("/otp-verify", usercontrollers.verifyOtp)

router.get("/addtocart/:id", middlewares.checkUserLoggedIn, usercontrollers.addToCart )
router.get("/cart", middlewares.checkUserLoggedIn, usercontrollers.shoppingCart)






module.exports = router;