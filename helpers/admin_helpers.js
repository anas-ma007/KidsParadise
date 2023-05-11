let db = require("../config/connection")
let collection = require('../config/collections')
const { PRODUCTS_COLLECTION } = require("../config/collections")
// const { Collection, ObjectID } = require('mongodb');
// var objectId = require('mongodb').ObjectID
const { ObjectId } = require("mongodb")
const { orderDetails } = require("../controllers/user_controllers")


module.exports = {
    addProduct: (productData, callback) => {
        productData.status = true
        productData.date = new Date()
        productData.price = parseInt(productData.price)
        productData.stock = parseInt(productData.stock)
        db.get().collection(collection.PRODUCTS_COLLECTION).insertOne(productData).then((data) => {
            callback(data.insertedId)
        })

    },
    addProductImages: (proId, imgUrl) => {
        return new Promise(async (resolve, reject) => {
            console.log(imgUrl);
            db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({ _id: new ObjectId(proId) },
                {
                    $set: {
                        image: imgUrl
                    }
                }).then((data) => {
                    resolve(data)
                })
        }
        );
    },

    editProductDetails: (proId, productdetails) => {
        return new Promise((res, rej) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({ _id: new ObjectId(proId) },
                {
                    $set: {
                        name: productdetails.name,
                        description: productdetails.description,
                        price: parseInt(productdetails.price),
                        stock: parseInt(productdetails.stock),
                        // pro_cat: productdetails.pro_cat,
                        // image: productdetails.image,
                        // password: productdetails.password
                    }
                }).then((response) => {
                    res(response)
                })
        })

    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            products = await db.get().collection(collection.PRODUCTS_COLLECTION).find().toArray()
            //  console.log(products,'suuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuiiiiiiiiii');
            resolve(products)
        })
    },

    usersLists: async () => {

        //() => {
        //     return new Promise(async (resolve, reject) => {
        //         users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
        //         // console.log(users, 'uuuussssseeerssssss');
        //         resolve(users)
        //     })
    },

    blockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(userId) }, { $set: { status: false } })
                .then((response) => {
                    resolve(response)
                    // console.log(response);
                })

        })
    },

    unblockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(userId) }, { $set: { status: true } })
                .then((response) => {
                    resolve(response)
                    // console.log(response);
                })
        })
    },

    viewAllCategories: () => {
        return new Promise(async (resolve, reject) => {
            category = await db.get().collection(collection.PRODUCTS_CATEGORY).find().toArray()
            resolve(category)
        })
    },


    getOrderDetails: (orderId) => {
        orderId=new ObjectId(orderId)
        console.log(orderId,"fgjghihij");
        return new Promise(async (resolve, reject) => {
            let orderDetails = await db.get().collection(collection.ORDERS).aggregate(
                [
                    {
                        '$match': {
                            '_id': orderId
                            
                        }
                    }, {
                        '$unwind': {
                            'path': '$products'
                        }
                    }, {
                        '$project': {
                            'productId': '$products.item',
                            'proQuanty': '$products.quantity',
                            'userId': '$userId'
                        }
                    }, {
                        '$lookup': {
                            'from': collection.PRODUCTS_COLLECTION,
                            'localField': 'productId',
                            'foreignField': '_id',
                            'as': 'productDetails'
                        }
                    }, {
                        '$unwind': {
                            'path': '$productDetails'
                        }
                    }, {
                        '$addFields': {
                            'totalPrice': {
                                '$multiply': [
                                    '$productDetails.price', '$proQuanty'
                                ]
                            }
                        }
                    }, {
                        '$lookup': {
                            'from': collection.USER_COLLECTION,
                            'localField': 'userId',
                            'foreignField': '_id',
                            'as': 'userDetails'
                        }
                    }, {
                        '$unwind': {
                            'path': '$userDetails'
                        }
                    }, {
                        '$unwind': {
                            'path': '$userDetails.address'
                        }
                    }
                ]
            )
            console.log(orderDetails, "orderdatils");
            // resolve(orderDetails)
        })

    },


    getCategoryCount: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.PRODUCTS_CATEGORY).find({ status: true }).toArray()
            // console.log(category.length, "category test");
            resolve(category.length)

        })
    },

    getProductCount: () => {
        return new Promise(async (resolve, reject) => {
            let productsCount = await db.get().collection(collection.PRODUCTS_COLLECTION).countDocuments({ status: true })
            // console.log(productsCount);
            resolve(productsCount)
        })

    },

    getOrderCount :async ()=>{
        let orderCount= await db.get().collection(collection.ORDERS).countDocuments()
        return orderCount
    }, 

    getTotalRevenue : async()=>{
        let total = await db.get().collection(collection.ORDERS).aggregate([
            {
                $group: {
                    _id:null,
                    totalAmount: { $sum: "$totalPrice" } // Calculate the sum of the "amount" field
                }
            },
            {
                $project: {
                    _id:0,
                    "total" : '$totalAmount'
                }
            }

        ]).toArray()
        // console.log(total);
        return total
    
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