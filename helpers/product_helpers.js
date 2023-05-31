const collection = require('../config/collections')
const db = require("../config/connection")
const { ObjectId } = require("mongodb")
const cloudinary = require("../utils/cloudinary")
const path = require("path")
const user_helpers = require('../helpers/user_helpers')



module.exports = {
    viewAddCategory: () => {

        try {
            return new Promise(async (resolve, reject) => {
                let category = await db.get().collection(collection.PRODUCTS_CATEGORY).find().toArray()
                resolve(category)
            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    addCategory: (catDetails) => {
        try {
            return new Promise(async (resolve, reject) => {
                let categoryExit = await db.get().collection(collection.PRODUCTS_CATEGORY).findOne({
                    category: { $regex: `^${catDetails.category}$`, $options: 'i' }
                });
                if (categoryExit) {
                    resolve({ status: false, message: "This category is already exist..!" });
                } else {
                    catDetails.status = true
                    let category = await db.get().collection(collection.PRODUCTS_CATEGORY).insertOne(catDetails)
                    resolve({ status: true, category })
                }
            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    doGetEditCategory: async () => {
        try {
            let category = await db.get().collection(collection.PRODUCTS_CATEGORY).find().toArray()
            return (category)

        } catch (error) {
            res.render('error', { error });
        }

    },
    doPostEditCategory: (catId) => {
        try {
            return new Promise(async (resolve, reject) => {
                let category = await db.get().collection(collection.PRODUCTS_CATEGORY).updateOne({ _id: new ObjectId(catId) }, { $set: { name: category.category } })
                resolve(category)
            })

        } catch (error) {
            res.render('error', { error });
        }
    },


    userGetProducts: async (skip, pageSize) => {
        try {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate([
                {
                    $lookup: {
                        from: collection.PRODUCTS_CATEGORY,
                        localField: "category",
                        foreignField: "category",
                        as: "category"
                    }
                },
                {
                    $unwind: "$category"
                },
                {
                    $match: {
                        "status": true,
                        "category.status": true
                    }
                },
                {
                    $skip: skip
                },
                {
                    $limit: pageSize
                }
            ]).toArray();
            return products

        } catch (error) {
            res.render('error', { error });
        }

    },

    userProductCount: async () => {
        try {
            let count = await db.get().collection(collection.PRODUCTS_COLLECTION).countDocuments({ status: true })
            return count

        } catch (error) {
            res.render('error', { error });
        }

    },

    getCategory: () => {
        try {
            return new Promise(async (resolve, reject) => {
                let category = await db.get().collection(collection.PRODUCTS_CATEGORY).find({ status: true }).toArray()
                resolve(category)
            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    blockProduct: (proId) => {
        try {
            return new Promise(async (resolve, reject) => {
                await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({ _id: new ObjectId(proId) }, { $set: { status: false } })
                    .then((response) => {
                        resolve(response)
                        console.log(response);
                    })
            })

        } catch (error) {
            res.render('error', { error });
        }

    },

    unblockProduct: (proId) => {
        try {
            return new Promise(async (resolve, reject) => {
                await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({ _id: new ObjectId(proId) }, { $set: { status: true } })
                    .then((response) => {
                        resolve(response)
                        console.log(response);
                    })
            })

        } catch (error) {
            res.render('error', { error });
        }

    },

    doEditProduct: (prodId) => {
        try {
            return new Promise(async (resolve, reject) => {
                db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: new ObjectId(prodId) }).then((response) => {
                    resolve(response)
                })
            })

        } catch (error) {
            res.render('error', { error });
        }
    },
    getProductDetails: (proId) => {
        try {
            return new Promise((resolve, rejection) => {
                db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: ObjectId(proId) }).then((product) => {
                    resolve(product)
                })
            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    doUnlistCategory: (catgId) => {
        try {
            return new Promise(async (resolve, reject) => {
                await db.get().collection(collection.PRODUCTS_CATEGORY).updateOne({ _id: new ObjectId(catgId) }, { $set: { status: false } }).then((response) => {
                    resolve(response)
                })
            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    doListCategory: (catgId) => {
        try {
            return new Promise(async (resolve, reject) => {
                await db.get().collection(collection.PRODUCTS_CATEGORY).updateOne({ _id: new ObjectId(catgId) }, { $set: { status: true } }).then((response) => {
                    resolve(response)
                })
            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    findAllProducts: async (skip, pageSize) => {
        try {
            const allProducts = await db.get().collection(collection.PRODUCTS_COLLECTION).find().skip(skip).limit(pageSize).toArray()
            return allProducts

        } catch (error) {
            res.render('error', { error });
        }
    },

    productCount: async () => {
        try {
            const productsCount = await db.get().collection(collection.PRODUCTS_COLLECTION).countDocuments()
            return productsCount

        } catch (error) {
            res.render('error', { error });
        }

    },


    searchProducts: async (name) => {
        try{
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ status: true, name: name }).toArray()
            return products

        } catch (error) {
          res.render('error', { error });
      }

    },

    doSearch: (details) => {
        try{
            return new Promise(async (resolve, reject) => {
                try {
                    const searchValue = details.search;
                    const products = await db.get().collection(collection.PRODUCTS_COLLECTION)
                        .find({
                            'name': { $regex: `.*${searchValue}.*`, $options: 'i' }
                        }).toArray();
                    resolve(products);
                } catch (err) {
                    reject(err);
                }
            })

        } catch (error) {
          res.render('error', { error });
      }
    },




    filterGetProducts: async (skip, pageSize, filter) => {
        try{
            if (filter === "high") {
                filter = -1;
                let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ status: true }).sort({ price: filter }).skip(skip).limit(pageSize).toArray()
                return products
            } else if (filter === 'low') {
                filter = 1
                let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ status: true }).sort({ price: filter }).skip(skip).limit(pageSize).toArray()
                return products
            }
            else if (filter === "newness") {
                filter = -1
                let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ status: true }).sort({ date: filter }).skip(skip).limit(pageSize).toArray()
                return products
            } else if (filter === '6k') {
                let products = await db.get().collection(collection.PRODUCTS_COLLECTION)
                    .find({ status: true, price: { $gte: 0, $lte: 6000 } }).toArray();
                return products;
            } else if (filter === '15k') {
                let products = await db.get().collection(collection.PRODUCTS_COLLECTION)
                    .find({ status: true, price: { $gte: 6000, $lte: 15000 } }).toArray();
                return products;
            } else if (filter === '15kabove') {
                let products = await db.get().collection(collection.PRODUCTS_COLLECTION)
                    .find({ status: true, price: { $gte: 15000 } }).toArray();
                return products;
            } else if (filter === "Jeep") {
                let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ status: true, category: "Jeep" }).toArray();
                return products
    
            } else if (filter === "Car") {
                let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ status: true, category: "Car" }).toArray();
                return products
    
            } else if (filter === "Bike") {
                let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ status: true, category: "Bike" }).toArray();
                return products
    
            }

        } catch (error) {
          res.render('error', { error });
      }
    },

    findAllSearchProduct: async (skip, limit, searchkey) => {
        try{
            const product = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate([
    
                {
                    $match: {
                        $or: [
                            { name: { $regex: searchkey, $options: 'i' } },
                            { category: { $regex: searchkey, $options: 'i' } },
                        ]
                    }
                },
                { $skip: skip },
                { $limit: limit }
            ]).toArray()
            return product

        } catch (error) {
          res.render('error', { error });
      }
    },

    getCartCount: async (userId) => {
        try{
            return new Promise(async (resolve, rejct) => {
                let count = 0
                let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) })
                if (cart) {
                    count = cart.products.length
                }
                resolve(count)
            })

        } catch (error) {
          res.render('error', { error });
      }

    },

    getOrderDetails: async (userid) => {
        try{
            let order = await db.get().collection(collection.ORDERS).aggregate(
                [
                    {
                        $match: {
                            userId: new ObjectId(userid)
                        }
                    },
                    {
                        $sort: { date: -1 }
                    }
                ]
            ).toArray()
            return order

        } catch (error) {
          res.render('error', { error });
      }
    },


    getAllOrders: () => {
        try{
            return new Promise(async (resolve, reject) => {
                await db.get().collection(collection.ORDERS).find().toArray().then((orders) => {
                    resolve(orders)
                })
            })

        } catch (error) {
          res.render('error', { error });
      }

    },

    orderProductDetail: async (orderId) => {
        try{
            let cartItems = await db.get().collection(collection.ORDERS)
                .aggregate([
                    {
                        $match: { _id: ObjectId(orderId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCTS_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: { $arrayElemAt: ['$product', 0] }
                        }
                    }
                ]).toArray()
            return cartItems

        } catch (error) {
          res.render('error', { error });
      }

    },

    findOrder: async (orderId) => {
        try{
            let order = await db.get().collection(collection.ORDERS).find({ _id: new ObjectId(orderId) }).toArray()
            return order

        } catch (error) {
          res.render('error', { error });
      }
    },


    shipproduct: (orderId) => {
        try{
            return new Promise(async (res, rej) => {
                await db.get().collection(collection.ORDERS).updateOne({ _id: new ObjectId(orderId) }, { $set: { orderstatus: "shipped" } })
                    .then((response) => {
                        res(response)
                    })
            })

        } catch (error) {
          res.render('error', { error });
      }
    },

    deliverProduct: (orderId) => {
        try{
            return new Promise(async (res, rej) => {
                await db.get().collection(collection.ORDERS).updateOne({ _id: new ObjectId(orderId) }, { $set: { orderstatus: "delivered" } })
                    .then((response) => {
                        res(response)
                    })
            })

        } catch (error) {
          res.render('error', { error });
      }
    },

    returnProduct: (orderId) => {
        try{
            return new Promise(async (res, rej) => {
                await db.get().collection(collection.ORDERS).updateOne({ _id: new ObjectId(orderId) }, { $set: { orderstatus: "return pending" } })
                    .then((response) => {
                        res(response)
                    })
            })

        } catch (error) {
          res.render('error', { error });
      }
    },

    returnConfirm: (orderId) => {
        try{
            return new Promise(async (res, rej) => {
                await db.get().collection(collection.ORDERS).updateOne({ _id: new ObjectId(orderId) }, { $set: { orderstatus: "order returned" } })
                    .then((response) => {
                        res(response)
                    })
            })

        } catch (error) {
          res.render('error', { error });
      }
    },

    cancelOrder: (orderId) => {
        try{
            return new Promise((res, rej) => {
                db.get().collection(collection.ORDERS).updateOne({ _id: new ObjectId(orderId) }, { $set: { orderstatus: "order cancelled" } })
                    .then((response) => {
                        res(response)
                    })
            })

        } catch (error) {
          res.render('error', { error });
      }
    },

    getOrderStatistics: () => {
        try{
            return new Promise(async (resolve, reject) => {
                let orderStatistics = await db.get().collection(collection.ORDERS).aggregate([
                    {
                        $group: {
                            _id: "$orderstatus",
                            count: { $sum: 1 },
                        }
    
                    }
    
                ]).toArray()
                resolve(orderStatistics)
    
            })

        } catch (error) {
          res.render('error', { error });
      }


    }    ,
    
    getSaleStatistics: () => {

        try{
            return new Promise(async (resolve, reject) => {
                let saleStatistics = await db.get().collection(collection.ORDERS).aggregate([
                    { $match: { totalPrice: { $exists: true } } },
                    {
                        $group: {
                            _id: { $month: { $toDate: "$date" } }, // Group by month of the "date" field
                            totalAmount: { $sum: "$totalPrice" } // Calculate the sum of the "amount" field
                        }
                    }, { $sort: { date: 1 } },
    
                ]).toArray()
                resolve(saleStatistics)
    
            })

        } catch (error) {
          res.render('error', { error });
      }
    },


    doaddCoupon: (couponDetails) => {
        try{
            return new Promise(async (resolve, reject) => {
                let couponExit = await db.get().collection(collection.COUPONS).findOne({
                    couponCode: { $regex: `^${couponDetails.couponCode}$`, $options: 'i' }
    
                });
                if (couponExit) {
                    resolve({ status: false, message: "This coupon already exists...!" });
                } else {
                    couponDetails.user = []
                    couponDetails.discount = parseInt(couponDetails.discount);
                    let coupon = await db.get().collection(collection.COUPONS).insertOne(couponDetails)
                    resolve({ status: true, coupon })
                }
            });

        } catch (error) {
          res.render('error', { error });
      }
    },

    getCoupons: async () => {
        
        try{
            let allCoupons = await db.get().collection(collection.COUPONS).find().toArray()
            console.log(allCoupons, "all coupons from pro helpers fun");
            return allCoupons

        } catch (error) {
          res.render('error', { error });
      }
    },

    findOrder: async (orderId) => {
        try{
            let order = await db.get().collection(collection.ORDERS).find({ _id: new ObjectId(orderId) }).sort({ date: -1 }).toArray()
            return order

        } catch (error) {
          res.render('error', { error });
      }
    },

    doimageDel: async (index, proId) => {
        try {
            const productId = new ObjectId(proId);
            await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                { _id: productId },
                { $unset: { [`image.${index}`]: "" } }
            );
        } catch (error) {
          res.render('error', { error });
      }
    },

    doReviewPost: async (review, proId, userName) => {
        
        try{
            return new Promise((resolve, rej) => {
                review.userName = userName
                db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                    { _id: new ObjectId(proId) },
                    {
                        $push: {
                            reviews: review,
                        }
                    }
                ).then((response) => {
                    resolve(response)
                })
            })

        } catch (error) {
          res.render('error', { error });
      }
    },






}












