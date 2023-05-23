let express = require('express');
let router = express.Router();
let adminControllers = require('../controllers/admin_controllers')
const upload = require('../utils/multer')
let middlewares =require('../middlewares/middlewares')




/* GET home page. */
router.get('/', adminControllers.admin_homepage) 

router.get('/login', adminControllers.admin_login) 
router.post('/login', adminControllers.admin_loginPost) 

router.post('/admin/login', adminControllers.adminLogout)

router.get('/addproducts',middlewares.checkAdminLoggedIn, adminControllers.add_product) 
router.post('/addproducts',middlewares.checkAdminLoggedIn, upload.array('productImage'), adminControllers.adminAddProductPost)

router.get('/viewproducts',middlewares.checkAdminLoggedIn, adminControllers.view_products) 

router.get('/viewusers',middlewares.checkAdminLoggedIn, adminControllers.view_users) 

router.get('/block_user/:id', middlewares.checkAdminLoggedIn,adminControllers.blockUser) 
router.get('/unblock_user/:id', middlewares.checkAdminLoggedIn,adminControllers.unblockUser) 

router.get('/addcategory', middlewares.checkAdminLoggedIn,  adminControllers.getCategory)
router.post('/addcategory',middlewares.checkAdminLoggedIn, adminControllers.postCategory)

// router.get('/editcategory/:id', middlewares.checkAdminLoggedIn,  adminControllers.getEditCategory)
// router.post('/editcategory/:id', middlewares.checkAdminLoggedIn,  adminControllers.postEditCategory)

router.get("/block_product/:id", middlewares.checkAdminLoggedIn, adminControllers.blockProduct)
router.get("/unblock_product/:id", middlewares.checkAdminLoggedIn, adminControllers.unblockProduct)

router.get("/edit_product/:id", middlewares.checkAdminLoggedIn, adminControllers.editProduct)
router.post("/edit_product/:id", middlewares.checkAdminLoggedIn,upload.array('image'), adminControllers.editProductPost)

router.get("/unlistcategory/:id", middlewares.checkAdminLoggedIn, adminControllers.unlistCategory)
router.get("/listcategory/:id", middlewares.checkAdminLoggedIn, adminControllers.listCategory)

router.get('/orders_details', middlewares.checkAdminLoggedIn, adminControllers.getOrderDetails)

router.get('/ship-product/:id',middlewares.checkAdminLoggedIn, adminControllers.shipProduct)
router.get('/deliver-product/:id',middlewares.checkAdminLoggedIn, adminControllers.deliverProduct)
router.get('/return-product/:id',middlewares.checkAdminLoggedIn, adminControllers.returnProduct)

router.get('/graph-statics',middlewares.checkAdminLoggedIn, adminControllers.graphStatics)
router.get('/ViewOrder_details/:id',middlewares.checkAdminLoggedIn, adminControllers.viewOrderDetails)

router.get("/addbanner", middlewares.checkAdminLoggedIn, adminControllers.addBanner)
router.get("/viewbanner", middlewares.checkAdminLoggedIn, adminControllers.viewBanner)
router.post("/addbanner", middlewares.checkAdminLoggedIn,upload.array('image'), adminControllers.postBanner)
router.get("/unlistbanner/:id", middlewares.checkAdminLoggedIn, adminControllers.unlistBanner)
router.get("/listbanner/:id", middlewares.checkAdminLoggedIn, adminControllers.listBanner)


router.get("/addcoupon", middlewares.checkAdminLoggedIn,  adminControllers.addCoupons)
router.get("/viewcoupons", middlewares.checkAdminLoggedIn,  adminControllers.viewCoupons)
router.post("/addcoupon", middlewares.checkAdminLoggedIn,  adminControllers.addCouponPost)

router.get("/addoffer", middlewares.checkAdminLoggedIn,  adminControllers.addOffer)
router.get("/viewoffer", middlewares.checkAdminLoggedIn,  adminControllers.viewOffer)
router.post("/addoffer", middlewares.checkAdminLoggedIn,  adminControllers.addOfferPost)






router.get("/")



module.exports = router;
