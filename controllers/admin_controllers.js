// const { response } = require('express');
let db = require('../config/collections');
let collection = require("../config/collections")
let adminHelpers = require("../helpers/admin_helpers")
const cloudinary = require('../utils/cloudinary')
const middlewares = require("../middlewares/middlewares");
const user_helpers = require('../helpers/user_helpers');
const { ObjectId } = require("mongodb")
const productHelpers = require("../helpers/product_helpers")

const adminCredential = {
    name: "Admin",
    email: "admin@gmail.com",
    password: "Admin@123",
};


module.exports = {
    admin_homepage: async (req, res) => {
        if (req.session.adminLoggedIn) {
            // let orderDetails= await adminHelpers.getOrderDetails()
            let categoryCount = await adminHelpers.getCategoryCount()
            let productsCount = await adminHelpers.getProductCount()
            let orderCount = await adminHelpers.getOrderCount()
            let totalRevenue= await adminHelpers.getTotalRevenue()
            let total=totalRevenue[0].total
            // console.log(total);
            // console.log(totalRevenue);
            res.render('admin_view/index', { layout: 'admin_layout', categoryCount, productsCount , orderCount, total})
        } else {
            res.render('admin_view/admin_login', { layout: 'admin_LogLayout' });
        }
    },

    admin_login: function (req, res) {
        res.render('admin_view/admin_login', { layout: 'admin_LogLayout' })
    },
    admin_loginPost: (req, res) => {
        console.log(req.body)
        if (req.body.email == adminCredential.email && req.body.password == adminCredential.password) {
            console.log("loggedInAdmin");
            req.session.admin = adminCredential
            req.session.adminLoggedIn = true
            adminStatus = req.session.adminLoggedIn
            res.redirect("/admin")
        } else {
            res.render('admin_view/admin_login', { layout: 'admin_LogLayout' })
        }
    },

    add_product: (req, res) => {
        productHelpers.getCategory().then((category) => {
            // console.log(category, "sooorajjj");

            if (req.session.adminLoggedIn) {
                res.render('admin_view/add_product', { category, layout: 'admin_layout' })
            } else {
                res.render('admin_view/admin_login', { layout: 'admin_LogLayout' })
            }
        })
    },


    adminAddProductPost: async (req, res) => {
        // console.log(req.body, 'pppppppppppppppppppppppppppppppppppp');
        try {
            console.log(req.files)
            const imgUrl = [];
            for (let i = 0; i < req.files.length; i++) {
                const result = await cloudinary.uploader.upload(req.files[i].path);
                imgUrl.push(result.url);
                // console.log(result.url);
            }
            adminHelpers.addProduct(req.body, async (id) => {
                adminHelpers.addProductImages(id, imgUrl).then((response) => {
                    // console.log(response);
                })
                // req.session.submitStatus="product added succesfully"
            })
        } catch (err) {
            // console.log(err);
        } finally {
            // req.session.submitStatus = "product Added"
            res.redirect('/admin/addproducts');
        }
    },
    view_products: async (req, res) => {
        // if (req.session.adminLoggedIn) {
        //     try {
        //         const page = parseInt(req.query.page) || 1;
        //         const pageSize = parseInt(req.query.pageSize) || 5;
        //         const skip = (page - 1) * pageSize;

        //         const products = await productHelpers.findAllProducts(skip, pageSize)

        //         const count = await productHelpers.productCount()

        //         const totalPages = Math.ceil(count / pageSize);
        //         const currentPage = page > totalPages ? totalPages : page;

        //         res.render('admin_view/view_products', {
        //             layout: 'admin_layout',
        //             products,
        //             totalPages,
        //             currentPage,
        //             pageSize
        //         });
        //     } catch (err) {
        //         // console.log(err, "hhihhihihihihih");
        //         res.render('admin_view/admin_login', { layout: 'admin_LogLayout' })
        //     }
        // }
        adminHelpers.getAllProducts().then((products) => {
            console.log(products, '999999999999999999999999999999');
            res.render('admin_view/view_products', { products, layout: 'admin_layout' })


        })
    },


    view_users: async (req, res) => {
        return new Promise(async (resolve, reject) => {
            const allUser = await user_helpers.findAllUser().then((allUser) => {
                // console.log(allUser);
                res.render('admin_view/view_users', { allUser, layout: 'admin_layout' })
            })

        })
        // if (req.session.adminLoggedIn) {
        //     try {
        //         const page = parseInt(req.query.page) || 1;
        //         const pageSize = parseInt(req.query.pageSize) || 6;
        //         const skip = (page - 1) * pageSize;

        //         const allUser = await user_helpers.findAllUser(skip, pageSize)
        //         const count = await user_helpers.findUserCount()

        //         const totalPages = Math.ceil(count / pageSize);
        //         const currentPage = page > totalPages ? totalPages : page;

        //         res.render('admin_view/view_users', {
        //             layout: 'admin_layout',
        //             allUser,
        //             totalPages,
        //             currentPage,
        //             pageSize
        //         });
        //     } catch (err) {
        //         // console.log(err, "hhihhihihihihih");
        //         res.render('admin_view/admin_login', { layout: 'admin_LogLayout' })
        //     }
        // }

        //     .then((users) => {
        //         // console.log(products,'999999999999999999999999999999');
        //         console.log(users, 'oooooooooooooooooooooooooo');
        //         res.render('admin_view/view_users', { users, layout: 'admin_layout' })
        //     })
        // } else {
        //     res.render('admin_view/admin_login', { layout: 'admin_LogLayout' })

    },


    blockUser: async (req, res) => {
        let userId = req.params.id;
        console.log(userId);
        if (req.session.adminLoggedIn) {
            await adminHelpers.blockUser(userId).then(() => {
                res.redirect('/admin/viewusers')
            })
        } else {
            res.render('admin_view/admin_login', { layout: 'admin_LogLayout' })
        }
    },
    unblockUser: async (req, res) => {
        let userId = req.params.id;
        console.log(userId);
        if (req.session.adminLoggedIn) {
            await adminHelpers.unblockUser(userId).then(() => {
                res.redirect('/admin/viewusers')
            })
        } else {
            res.render('admin_view/admin_login', { layout: 'admin_LogLayout' })
        }
    },

    getCategory: (req, res) => {
        productHelpers.viewAddCategory().then((category) => {
            res.render("admin_view/add_category", { category, layout: 'admin_layout', message:"" })
        })
    },

    postCategory: async (req, res) => {
        let category = await productHelpers.viewAddCategory()
        productHelpers.addCategory(req.body).then((response) => {
            if (response.status) {
                res.redirect("/admin/addcategory")
            } else {
                res.render("admin_view/add_category", { category, layout: 'admin_layout', message: response.message })
            }
        })
    },

    getEditCategory: (req, res) => {
        productHelpers.doGetEditCategory().then((category) => {
            res.render("admin_view/add_category", { category, layout: 'admin_layout' })
        })
    },
    postEditCategory: (req, res) => {
        let catId = req.params.id;
        productHelpers.doPostEditCategory(catId).then((category) => {
            res.redirect("/admin/addcategory")
        })

    },

    blockProduct: async (req, res) => {
        let proId = req.params.id;
        await productHelpers.blockProduct(proId).then(() => {
            res.redirect("/admin/viewproducts")
        })

    },
    unblockProduct: async (req, res) => {
        let proId = req.params.id;
        await productHelpers.unblockProduct(proId).then(() => {
            res.redirect("/admin/viewproducts")
        })
    },

    adminLogout: (req, res) => {
        req.session.destroy();
        res.redirect("/")
    },

    editProduct: async (req, res) => {
        let prodId = req.params.id;
        // console.log(req.params.id,'/////////////////////////');
        await productHelpers.doEditProduct(prodId).then((response) => {
            console.log(response);
            res.render("admin_view/edit_products", { layout: 'admin_layout', response })
        })
    },

    editProductPost: async (req, res) => {
        // console.log('THIS IS REQUSESY -----', req.body)
        try {
            const imgUrl = [];
            for (let i = 0; i < req.files.length; i++) {
                const result = await cloudinary.uploader.upload(req.files[i].path);
                imgUrl.push(result.url);
                // console.log(result.url);
            }
            // console.log(req.params.id, req.body, 'oooooooooooooooooooooooooooo');
            // proId=req.params.id
            adminHelpers.editProductDetails(req.params.id, req.body).then(() => {
                if (imgUrl.length != 0) {
                    adminHelpers.addProductImages(req.params.id, imgUrl).then((response) => {
                        // console.log(response);
                    })
                }
            })
        } catch (err) {
            console.log(err);
        } finally {
            res.redirect('/admin/viewproducts');
        }
    },

    unlistCategory: async (req, res) => {
        let catgId = req.params.id;
        // console.log(catgId,'[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]');
        await productHelpers.doUnlistCategory(catgId).then(() => {
            res.redirect("/admin/addcategory")
        })
    },

    listCategory: async (req, res) => {
        let catgId = req.params.id;
        // console.log(catgId,'[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]');
        await productHelpers.doListCategory(catgId).then(() => {
            res.redirect("/admin/addcategory")
        })

    },
    getOrderDetails: async (req, res) => {
        return new Promise(async () => {
            let allOrders = await productHelpers.getAllOrders()
            res.render("admin_view/all_orders", { allOrders, layout: 'admin_layout' })
        })
    },

    shipProduct: async (req, res) => {
        let orderId = req.params.id
        console.log(orderId, "orderId in shipproduct");
        await productHelpers.shipproduct(orderId).then(() => {
            res.redirect('/admin/order-details')
        })
    },

    deliverProduct: async (req, res) => {
        let orderId = req.params.id
        await productHelpers.deliverProduct(orderId).then(() => {
            res.redirect('/admin/order-details')
        })
    },

    returnProduct: async (req, res) => {
        let orderId = req.params.id
        await productHelpers.returnConfirm(orderId).then(() => {
            res.redirect('/admin/order-details')
        })
    },

    graphStatics: async (req, res) => {
        let OrderStatistics = await adminHelpers.getOrderStatistics()
        let saleStatistics = await adminHelpers.getSaleStatistics()
        res.json({ OrderStatistics, saleStatistics })
    },

    viewOrderDetails : async (req, res) => {
        // console.log(req.body, "req.bodyyy");
        console.log(req.params.id, "req.params.id");
             const orderId=req.params.id
            let orderDetails= await adminHelpers.getOrderDetails(orderId)    /////test
            // await productHelpers.findOrder(req.params.id).then(async (order) => {
            //     let products = await productHelpers.orderProductDetail(req.params.id);
            //     let totalPrice = order[0].totalPrice
            //     let user = await user_helpers.getUser(order[0].userId)
                // console.log(user, "user" );
                // console.log(totalPrice, "total price");
                // console.log(products, "productsss");
                // console.log(order, "orderrrrrr");
                // res.render('admin_view/order_details', { layout: 'admin_layout', order, user, products, totalPrice })
            // })
    },


  



}
