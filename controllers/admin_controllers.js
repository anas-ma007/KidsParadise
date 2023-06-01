let db = require('../config/collections');
let collection = require("../config/collections")
let adminHelpers = require("../helpers/admin_helpers")
let cloudinary = require('../utils/cloudinary')
let middlewares = require("../middlewares/middlewares");
let user_helpers = require('../helpers/user_helpers');
let { ObjectId } = require("mongodb")
let productHelpers = require("../helpers/product_helpers")

let adminCredential = {
    name: "Admin",
    email: "admin@gmail.com",
    password: "Admin@123",
};


module.exports = {

    admin_homepage: async (req, res) => {
        try {
            if (req.session.adminLoggedIn) {
                let categoryCount = await adminHelpers.getCategoryCount();
                let productsCount = await adminHelpers.getProductCount();
                let orderCount = await adminHelpers.getOrderCount();
                let totalRevenue = await adminHelpers.getTotalRevenue();
                let total = totalRevenue[0]?.total;

                res.render('admin_view/index', { layout: 'admin_layout', categoryCount, productsCount, orderCount, total });
            } else {
                res.render('admin_view/admin_login', { layout: 'admin_LogLayout' });
            }
        } catch (error) {
            res.render('error', { error });
        }
    },

    admin_login: function (req, res) {
        try {
            res.render('admin_view/admin_login', { layout: 'admin_LogLayout' })

        }catch (error) {
            res.render('error', { error });
        }
    
    },

    admin_loginPost: async (req, res) => {
        try {
            if (req.body.email == adminCredential.email && req.body.password == adminCredential.password) {
                req.session.admin = adminCredential;
                req.session.adminLoggedIn = true;
                adminStatus = req.session.adminLoggedIn;
                res.redirect("/admin");
            } else {
                res.render('admin_view/admin_login', { layout: 'admin_LogLayout' });
            }
        } catch (error) {
            res.render('error', { error });
        }
    },


    add_product: (req, res) => {
        try {
            productHelpers.getCategory().then((category) => {
                if (req.session.adminLoggedIn) {
                    res.render('admin_view/add_product', { category, layout: 'admin_layout' })
                } else {
                    res.render('admin_view/admin_login', { layout: 'admin_LogLayout' })
                }
            })

        }
        catch (error) {
            res.render('error', { error });
        }
    },


    adminAddProductPost: async (req, res) => {
        try {
            const imgUrl = [];
            for (let i = 0; i < req.files.length; i++) {
                const result = await cloudinary.uploader.upload(req.files[i].path);
                imgUrl.push(result.url);
            }
            adminHelpers.addProduct(req.body, async (id) => {
                adminHelpers.addProductImages(id, imgUrl).then((response) => {
                })
            })
        } catch (error) {
            res.render('error', { error });
        } finally {
            res.redirect('/admin/addproducts');
        }
    },

    view_products: async (req, res) => {

        await adminHelpers.getAllProducts().then((products) => {
            res.render('admin_view/view_products', { products, layout: 'admin_layout' })

        })
    },


    view_users: async (req, res) => {

        try {
            return new Promise(async (resolve, reject) => {
                const allUser = await user_helpers.findAllUser().then((allUser) => {
                    res.render('admin_view/view_users', { allUser, layout: 'admin_layout' })
                })

            })
        }
        catch (error) {
            res.render('error', { error });
        }
    },


    blockUser: async (req, res) => {

        try {
            let userId = req.params.id;
            if (req.session.adminLoggedIn) {
                await adminHelpers.blockUser(userId).then(() => {
                    res.redirect('/admin/viewusers')
                })
            } else {
                res.render('admin_view/admin_login', { layout: 'admin_LogLayout' })
            }

        }
        catch (error) {
            res.render('error', { error });
        }
    },
    unblockUser: async (req, res) => {

        try {
            let userId = req.params.id;
            if (req.session.adminLoggedIn) {
                await adminHelpers.unblockUser(userId).then(() => {
                    res.redirect('/admin/viewusers')
                })
            } else {
                res.render('admin_view/admin_login', { layout: 'admin_LogLayout' })
            }

        }
        catch (error) {
            res.render('error', { error });
        }
    },

    getCategory: (req, res) => {

        try {
            productHelpers.viewAddCategory().then((category) => {
                res.render("admin_view/add_category", { category, layout: 'admin_layout', message: "" })
            })

        }
        catch (error) {
            res.render('error', { error });
        }
    },

    postCategory: async (req, res) => {

        try {
            let category = await productHelpers.viewAddCategory()
            productHelpers.addCategory(req.body).then((response) => {
                if (response.status) {
                    res.redirect("/admin/addcategory")
                } else {
                    res.render("admin_view/add_category", { category, layout: 'admin_layout', message: response.message })
                }
            })

        }
        catch (error) {
            res.render('error', { error });
        }
    },

    getEditCategory: async (req, res) => {

        try {
            await productHelpers.doGetEditCategory().then((category) => {
                res.render("admin_view/add_category", { category, layout: 'admin_layout' })
            })

        }
        catch (error) {
            res.render('error', { error });
        }
    },
    postEditCategory: async (req, res) => {

        try {
            let catId = req.params.id;
            await productHelpers.doPostEditCategory(catId).then((category) => {
                res.redirect("/admin/addcategory")
            })

        }
        catch (error) {
            res.render('error', { error });
        }

    },

    blockProduct: async (req, res) => {

        try {
            let proId = req.params.id;
            await productHelpers.blockProduct(proId).then(() => {
                res.redirect("/admin/viewproducts")
            })

        }
        catch (error) {
            res.render('error', { error });
        }

    },
    unblockProduct: async (req, res) => {
        try {
            let proId = req.params.id;
            await productHelpers.unblockProduct(proId).then(() => {
                res.redirect("/admin/viewproducts")
            })

        }
        catch (error) {
            res.render('error', { error });
        }
    },

    adminLogout: (req, res) => {
        req.session.destroy();
        res.redirect("/")
    },

    editProduct: async (req, res) => {

        try {
            let prodId = req.params.id;
            await productHelpers.doEditProduct(prodId).then((response) => {
                console.log(response);
                res.render("admin_view/edit_products", { layout: 'admin_layout', response })
            })

        }
        catch (error) {
            res.render('error', { error });
        }
    },

    editProductPost: async (req, res) => {
        try {
            const imgUrl = [];
            for (let i = 0; i < req.files.length; i++) {
                const result = await cloudinary.uploader.upload(req.files[i].path);
                imgUrl.push(result.url);

            }
            adminHelpers.editProductDetails(req.params.id, req.body).then(() => {
                if (imgUrl.length != 0) {
                    adminHelpers.addProductImages(req.params.id, imgUrl).then((response) => {
                    })
                }
            })
        } catch (error) {
            res.render('error', { error });
        } finally {
            res.redirect('/admin/viewproducts');
        }
    },

    unlistCategory: async (req, res) => {
        try{
            let catgId = req.params.id;
            await productHelpers.doUnlistCategory(catgId).then(() => {
                res.redirect("/admin/addcategory")
            })

        }catch (error) {
            res.render('error', { error });
        }
    },

    listCategory: async (req, res) => {
        try{
            let catgId = req.params.id;
            await productHelpers.doListCategory(catgId).then(() => {
                res.redirect("/admin/addcategory")
            })

        }catch (error) {
            res.render('error', { error });
        }

    },
    getOrderDetails: async (req, res) => {
        try{
            return new Promise(async () => {
                let allOrders = await productHelpers.getAllOrders()
                res.render("admin_view/all_orders", { allOrders, layout: 'admin_layout' })
            })

        }catch (error) {
            res.render('error', { error });
        }
    },

    shipProduct: async (req, res) => {
        try{
            let orderId = req.params.id
            await productHelpers.shipproduct(orderId).then(() => {
                res.redirect('/admin/order-details')
            })

        }catch (error) {
            res.render('error', { error });
        }
    },

    deliverProduct: async (req, res) => {
        try{
            let orderId = req.params.id
            await productHelpers.deliverProduct(orderId).then(() => {
                res.redirect('/admin/order-details')
            })

        }catch (error) {
            res.render('error', { error });
        }
    },

    returnProduct: async (req, res) => {
        try{
            let orderId = req.params.id
            let totalAmount = await user_helpers.totalAmount(orderId)
            let userId = await user_helpers.orderUser(orderId)
            let orders = await productHelpers.findOrder(orderId)
            await productHelpers.returnConfirm(orderId).then(async () => {
                await user_helpers.incWallet(userId, totalAmount)
                await user_helpers.incrementStock(orders[0].products).then(() => {
                    res.redirect('/admin/order-details')
                })
            })

        }catch (error) {
            res.render('error', { error });
        }
    },

    graphStatics: async (req, res) => {
        try{
            let OrderStatistics = await adminHelpers.getOrderStatistics()
            let saleStatistics = await adminHelpers.getSaleStatistics()
            res.json({ OrderStatistics, saleStatistics })

        }catch (error) {
            res.render('error', { error });
        }
    },



    viewOrderDetails: async (req, res) => {
        try {
            const orderId = req.params.id;
            await productHelpers.findOrder(req.params.id).then(async (order) => {
                let products = await productHelpers.orderProductDetail(req.params.id);
                let totalPrice = order[0].totalPrice;
                let user = await user_helpers.getUser(order[0].userId);

                res.render('admin_view/order_details', { layout: 'admin_layout', order, user, products, totalPrice });
            });
        } catch (error) {
            res.render('error', { error });
        }
    },


    addBanner: (req, res) => {
        try{
            res.render("admin_view/addbanner", { layout: "admin_layout" })

        }catch (error) {
            res.render('error', { error });
        }
    },



    postBanner: async (req, res) => {
        const imgUrl = [];
        
        try {
            for (let i = 0; i < req.files?.length; i++) {
                const result = await cloudinary.uploader.upload(req.files[i].path);
                imgUrl.push(result.url);
            }
            
            const id = await adminHelpers.addBanner(req.body);
            await adminHelpers.addBannerImages(id, imgUrl);

            res.render("admin_view/addbanner", { layout: "admin_layout", message: error.message });
        } catch (error) {
            res.render("admin_view/addbanner", { layout: "admin_layout", message: error.message });
        }
    },

    viewBanner: async (req, res) => {

        try {
            let banner = await adminHelpers.getBanners()
            res.render("admin_view/view_banners", { layout: "admin_layout", banner });

        }
        catch (error) {
            res.render('error', { error });
        }
    },


    unlistBanner: async (req, res) => {

        try {
            let bannerId = req.params.id
            await adminHelpers.doUnlistBanner(bannerId).then(() => {
                res.redirect("/admin/viewbanner")
            })

        }
        catch (error) {
            res.render('error', { error });
        }
    },

    listBanner: async (req, res) => {
        try{
            let bannerId = req.params.id
            await adminHelpers.doListBanner(bannerId).then(() => {
                res.redirect("/admin/viewbanner")
            })

        }catch (error) {
            res.render('error', { error });
        }
    },


    addCoupons: async (req, res) => {

        try {
            res.render("admin_view/addcoupon", { layout: "admin_layout", message: "" })

        }
        catch (error) {
            res.render('error', { error });
        }
    },


    addCouponPost: async (req, res) => {

        try {
            await productHelpers.doaddCoupon(req.body).then((response) => {
                if (response.status) {
                    res.redirect("/admin/addcoupon")
                } else {
                    res.render("admin_view/addcoupon", { layout: "admin_layout", message: response.message })
                }
            })

        }
        catch (error) {
            res.render('error', { error });
        }
    },

    viewCoupons: async (req, res) => {

        try {
            let coupons = await productHelpers.getCoupons()
            res.render("admin_view/view_coupons", { layout: "admin_layout", coupons })

        }
        catch (error) {
            res.render('error', { error });
        }
    },

    addOffer: async (req, res) => {
        try {
            let category = await productHelpers.getCategory()
            res.render("admin_view/addoffer", { layout: "admin_layout", category })

        }
        catch (error) {
            res.render('error', { error });
        }
    },

    addOfferPost: async (req, res) => {

        try {
            let offer = req.body
            await adminHelpers.addOfferPrice(offer)
            res.redirect("/admin/addoffer")

        }
        catch (error) {
            res.render('error', { error });
        }
    },

    viewOffer: async (req, res) => {


        try {
            let products = await adminHelpers.getAllProducts()
            res.render("admin_view/view_offer", { layout: "admin_layout", products })

        }
        catch (error) {
            res.render('error', { error });
        }
    },

    addProductOffer: async (req, res) => {

        try {
            let products = await adminHelpers.getAllProducts()
            res.render("admin_view/addproductoff", { layout: "admin_layout", products })

        }
        catch (error) {
            res.render('error', { error });
        }
    },

    addProductOfferPost: async (req, res) => {
        try {

            let offer = req.body
            await adminHelpers.addProductOffPrice(offer)
            res.redirect("/admin/viewoffer")
        }
        catch (error) {
            res.render('error', { error });
        }
    },

    deactivateProOffer: async (req, res) => {
        try {
            let proId = req.params.id
            await adminHelpers.deactivateOffPrice(proId)
            res.redirect("/admin/viewoffer")

        }
        catch (error) {
            res.render('error', { error });
        }

    },
    deactivateCategoryOffer: async (req, res) => {

        try {
            let category = await productHelpers.getCategory()

            res.render("admin_view/deleteCategoryOffer", { layout: "admin_layout", category })

        }
        catch (error) {
            res.render('error', { error });
        }


    },
    deactivateCategoryOfferPost: async (req, res) => {
        try {
            let categoryName = req.body

            await adminHelpers.deactivateCategoryOffer(categoryName)
            res.redirect("/admin/viewoffer")

        }
        catch (error) {
            res.render('error', { error });
        }
    },

    getSalesReport: async (req, res) => {

        try {

            let allOrders = await productHelpers.getAllOrders()
            res.render("admin_view/sales-report", { allOrders, layout: 'admin_layout' })

        }
        catch (error) {
            res.render('error', { error });
        }
    },
    salesreportfiler:async(req,res)=>{
        try{
            console.log(req.body.startDate, req.body.endDate, "req body date");
            let strtDate=Date.parse(req.body.startDate)
            let enDate = Date.parse(req.body.endDate)
            let allOrders = await productHelpers.salesreportfilterpost(strtDate,enDate)
            // res.redirect('/salereport')
            res.render("admin_view/sales-report", { allOrders, layout: 'admin_layout' })
            
        }
        catch(err){
            console.log(err);
        }
    },


    doEditImage: async (req, res) => {

        try {
            let index = req.body.index
            let proId = req.body.proId

            await productHelpers.doimageDel(index, proId).then(() => {
                res.json(true)

            })
        }
        catch (error) {
            res.render('error', { error });
        }
    },













}
