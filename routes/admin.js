let express = require('express');
let router = express.Router();
let adminControllers = require('../controllers/admin_controllers')
const upload = require('../utils/multer')
let middlewares =require('../middlewares/middlewares')


/* GET home page. */

// LOGIN  
router.get('/', adminControllers.admin_homepage) 
router.get('/login', adminControllers.admin_login) 
router.post('/login', adminControllers.admin_loginPost) 
router.post('/admin/login', adminControllers.adminLogout)


// USER MANAGEMENT 
router.get('/viewusers',middlewares.checkAdminLoggedIn, adminControllers.view_users) 
router.get('/block_user/:id', middlewares.checkAdminLoggedIn,adminControllers.blockUser) 
router.get('/unblock_user/:id', middlewares.checkAdminLoggedIn,adminControllers.unblockUser) 


// PRODUCT MANAGEMENT 
router.get('/viewproducts',middlewares.checkAdminLoggedIn, adminControllers.view_products) 
router.get('/addproducts',middlewares.checkAdminLoggedIn, adminControllers.add_product) 
router.post('/addproducts',middlewares.checkAdminLoggedIn, upload.array('productImage'), adminControllers.adminAddProductPost)
router.get("/block_product/:id", middlewares.checkAdminLoggedIn, adminControllers.blockProduct)
router.get("/unblock_product/:id", middlewares.checkAdminLoggedIn, adminControllers.unblockProduct)
router.get("/edit_product/:id", middlewares.checkAdminLoggedIn, adminControllers.editProduct)
router.post("/edit_product/:id", middlewares.checkAdminLoggedIn,upload.array('image'), adminControllers.editProductPost)


// CATEGORY MANAGEMENT 
router.get('/addcategory', middlewares.checkAdminLoggedIn,  adminControllers.getCategory)
router.post('/addcategory',middlewares.checkAdminLoggedIn, adminControllers.postCategory)
router.get("/unlistcategory/:id", middlewares.checkAdminLoggedIn, adminControllers.unlistCategory)
router.get("/listcategory/:id", middlewares.checkAdminLoggedIn, adminControllers.listCategory)
// router.get('/editcategory/:id', middlewares.checkAdminLoggedIn,  adminControllers.getEditCategory)
// router.post('/editcategory/:id', middlewares.checkAdminLoggedIn,  adminControllers.postEditCategory)


// ORDER MANAGEMENT  
router.get('/orders_details', middlewares.checkAdminLoggedIn, adminControllers.getOrderDetails)
router.get('/ship-product/:id',middlewares.checkAdminLoggedIn, adminControllers.shipProduct)
router.get('/deliver-product/:id',middlewares.checkAdminLoggedIn, adminControllers.deliverProduct)
router.get('/return-product/:id',middlewares.checkAdminLoggedIn, adminControllers.returnProduct)


// DASHBOARD 
router.get('/graph-statics',middlewares.checkAdminLoggedIn, adminControllers.graphStatics)
router.get('/ViewOrder_details/:id',middlewares.checkAdminLoggedIn, adminControllers.viewOrderDetails)


// BANNER MANAGEMENT 
router.get("/addbanner", middlewares.checkAdminLoggedIn, adminControllers.addBanner)
router.get("/viewbanner", middlewares.checkAdminLoggedIn, adminControllers.viewBanner)
router.post("/addbanner", middlewares.checkAdminLoggedIn,upload.array('image'), adminControllers.postBanner)
router.get("/unlistbanner/:id", middlewares.checkAdminLoggedIn, adminControllers.unlistBanner)
router.get("/listbanner/:id", middlewares.checkAdminLoggedIn, adminControllers.listBanner)


// COUPON MANAGEMENT 
router.get("/addcoupon", middlewares.checkAdminLoggedIn,  adminControllers.addCoupons)
router.get("/viewcoupons", middlewares.checkAdminLoggedIn,  adminControllers.viewCoupons)
router.post("/addcoupon", middlewares.checkAdminLoggedIn,  adminControllers.addCouponPost)


// OFFER MANAGEMENT
router.get("/addoffer", middlewares.checkAdminLoggedIn,  adminControllers.addOffer)
router.post("/addoffer", middlewares.checkAdminLoggedIn,  adminControllers.addOfferPost)
router.get("/viewoffer", middlewares.checkAdminLoggedIn,  adminControllers.viewOffer)
router.get("/add-product-offer", middlewares.checkAdminLoggedIn,  adminControllers.addProductOffer)
router.post("/add-product-offer", middlewares.checkAdminLoggedIn,  adminControllers.addProductOfferPost)
router.get("/deactivateProOffer/:id", middlewares.checkAdminLoggedIn,  adminControllers.deactivateProOffer )
router.get("/deactivateCategoryOffer", middlewares.checkAdminLoggedIn,  adminControllers.deactivateCategoryOffer )
router.post("/deactivateCategoryOffer", middlewares.checkAdminLoggedIn,  adminControllers.deactivateCategoryOfferPost )


// SALES REPORT 
router.get("/salereport", middlewares.checkAdminLoggedIn,  adminControllers.getSalesReport)
router.post("/salereport", middlewares.checkAdminLoggedIn,  adminControllers.salesreportfiler)
router.post("/deleteImage",  middlewares.checkAdminLoggedIn, adminControllers.doEditImage)

router.get("/")



module.exports = router;
