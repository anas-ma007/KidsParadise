const collection = require('../config/collections')
const db = require("../config/connection")
const { ObjectId } = require("mongodb")
const cloudinary = require("../utils/cloudinary")
const path = require("path")
// let adminHelpers = require("../helpers/admin_helpers")
const user_helpers = require('../helpers/user_helpers')
// const { response } = require('../app')



module.exports = {
    viewAddCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.PRODUCTS_CATEGORY).find().toArray()
            resolve(category)
        })
    },

    addCategory: (catDetails) => {
        return new Promise(async (resolve, reject) => {
            let categoryExit = await db.get().collection(collection.PRODUCTS_CATEGORY).findOne({
                category: { $regex: `^${catDetails.category}$`, $options: 'i' }
              });
            if(categoryExit){
                resolve({ status: false, message: "This category is already exist..!" });
            }else{
                catDetails.status = true
            let category = await db.get().collection(collection.PRODUCTS_CATEGORY).insertOne(catDetails)
            resolve({status: true, category})
            }
        })
    },

    doGetEditCategory: async () => {
        let category = await db.get().collection(collection.PRODUCTS_CATEGORY).find().toArray()
        return (category)

    },
    doPostEditCategory: (catId) => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.PRODUCTS_CATEGORY).updateOne({ _id: new ObjectId(catId) }, { $set: { name: category.category } })
            resolve(category)
        })
    },

    // getProducts: () => {
    //     return new Promise(async (resolve, reject) => {
    //         let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ status: true }).toArray()
    //         resolve(products)
    //     })
    // },
    userGetProducts: async (skip, pageSize) => {
        console.log(skip, pageSize, "hiihihihihihihihihihi");
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

        // console.log(products, "products only from status true");

        return products

    },

    userProductCount: async () => {
        // console.log( "sgzsxbg");
        let count = await db.get().collection(collection.PRODUCTS_COLLECTION).countDocuments({ status: true })
        // console.log(count, "sgzsg");
        return count

    },

    getCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.PRODUCTS_CATEGORY).find({ status: true }).toArray()
            // console.log(category, "category test");
            resolve(category)
        })
    },

    blockProduct: (proId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({ _id: new ObjectId(proId) }, { $set: { status: false } })
                .then((response) => {
                    resolve(response)
                    console.log(response);
                })
        })

    },

    unblockProduct: (proId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({ _id: new ObjectId(proId) }, { $set: { status: true } })
                .then((response) => {
                    resolve(response)
                    console.log(response);
                })
        })

    },

    doEditProduct: (prodId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: new ObjectId(prodId) }).then((response) => {
                console.log(response + "poooooooooooooyyyyyyyyyyy");
                resolve(response)
            })
        })
    },
    getProductDetails: (proId) => {
        return new Promise((resolve, rejection) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: ObjectId(proId) }).then((product) => {
                console.log(product, "get productdetails in product heplers");
                resolve(product)
            })
        })
    },

    doUnlistCategory: (catgId) => {
        console.log("catorgory 5285828282")
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCTS_CATEGORY).updateOne({ _id: new ObjectId(catgId) }, { $set: { status: false } }).then((response) => {
                resolve(response)
                // console.log(response);
            })
        })
    },

    doListCategory: (catgId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCTS_CATEGORY).updateOne({ _id: new ObjectId(catgId) }, { $set: { status: true } }).then((response) => {
                resolve(response)
                // console.log(response);
            })
        })
    },

    findAllProducts: async (skip, pageSize) => {
        const allProducts = await db.get().collection(collection.PRODUCTS_COLLECTION).find().skip(skip).limit(pageSize).toArray()
        return allProducts
    },

    productCount: async () => {
        const productsCount = await db.get().collection(collection.PRODUCTS_COLLECTION).countDocuments()
        return productsCount

    },

    //vijay search products page
    searchProducts: async (name) => {
        let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ status: true, name: name }).toArray()
        return products

    },

    doSearch: (details) => {
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
    },




    filterGetProducts: async (skip, pageSize, filter) => {
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
        } else if (filter === "jeep") {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ status: true, category: "Jeep" }).toArray();
            return products

        } else if (filter === "car") {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ status: true, category: "Car" }).toArray();
            return products

        } else if (filter === "bike") {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ status: true, category: "Bike" }).toArray();
            return products

        }
    },

    findAllSearchProduct: async (skip, limit, searchkey) => {
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
    },

    getCartCount: (userId) => {
        return new Promise(async (resolve, rejct) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })

    },

    getOrderDetails: async (userid) => {
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
    },

    // doGetStockCount : async (userId)=>{
    //     let count=

    // }

    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDERS).find().toArray().then((orders) => {
                resolve(orders)
            })
        })

    },

    orderProductDetail: async (orderId) => {
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
        // console.log(cartItems, "Cartitems ingggggggggggggggggggggggggggggggg ");
        return cartItems

    },

    findOrder: async (orderId) => {
        let order = await db.get().collection(collection.ORDERS).find({ _id: new ObjectId(orderId) }).toArray()
        // console.log(order,"orderssssss from helper"); 
        return order
    },


    shipproduct: (orderId) => {
        return new Promise(async (res, rej) => {
            await db.get().collection(collection.ORDERS).updateOne({ _id: new ObjectId(orderId) }, { $set: { orderstatus: "shipped" } })
                .then((response) => {
                    res(response)
                })
        })
    },

    deliverProduct: (orderId) => {
        return new Promise(async (res, rej) => {
            await db.get().collection(collection.ORDERS).updateOne({ _id: new ObjectId(orderId) }, { $set: { orderstatus: "delivered" } })
                .then((response) => {
                    res(response)
                })
        })
    },

    returnProduct: (orderId) => {
        return new Promise(async (res, rej) => {
            await db.get().collection(collection.ORDERS).updateOne({ _id: new ObjectId(orderId) }, { $set: { orderstatus: "return pending" } })
                .then((response) => {
                    res(response)
                })
        })
    },

    returnConfirm: (orderId) => {
        return new Promise(async (res, rej) => {
            await db.get().collection(collection.ORDERS).updateOne({ _id: new ObjectId(orderId) }, { $set: { orderstatus: "order returned" } })
                .then((response) => {
                    res(response)
                })
        })
    },

    cancelOrder: (orderId) => {
        return new Promise(async (res, rej) => {
            await db.get().collection(collection.ORDERS).updateOne({ _id: new ObjectId(orderId) }, { $set: { orderstatus: "order cancelled" } })
                .then((response) => {
                    res(response)
                })
        })
    },

    getOrderStatistics: () => {
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


    }
    , getSaleStatistics: () => {
       
        return new Promise(async (resolve, reject) => {
            let saleStatistics = await db.get().collection(collection.ORDERS).aggregate([
                { $match: { totalPrice: { $exists: true } } },
                {
                    $group: {
                        _id: { $month:{$toDate: "$date" }}, // Group by month of the "date" field
                        totalAmount: { $sum: "$totalPrice" } // Calculate the sum of the "amount" field
                    }
                }, { $sort: { date: 1 } },

            ]).toArray()
            resolve(saleStatistics)

        })


    },










}
