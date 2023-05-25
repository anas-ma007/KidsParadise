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
        productData.offer = 0
        productData.price = parseInt(productData.price)
        productData.stock = parseInt(productData.stock)
        // console.log("api calll 6878989");
        db.get().collection(collection.PRODUCTS_COLLECTION).insertOne(productData).then((data) => {
            // console.log(data, "data from database");
            // console.log(data.insertedId, "data inserted id in add product");
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

    // addBanner: (bannerDetails) => {
    //     return new Promise(async (resolve, reject) => {
    //         let bannerExit = await db.get().collection(collection.BANNERS).findOne({ name: { $regex: `^${bannerDetails.name}$`, $options: 'i' } });
    // if (bannerExit) {
    //     resolve({ status: false, message: 'This banner already exists...!' });
    //         } else {
    //             bannerDetails.status = true;
    //             db.get().collection(collection.BANNERS).insertOne({
    //                 name: bannerDetails.name,
    //                 subtitle: bannerDetails.subtitle,
    //                 // bannerUrl: bannerDetails.bannerUrl,
    //             }).then((data)=>{
    //                 console.log(data,)
    //                 console.log(data.insertedId)
    //                 resolve(data.insertedId);
    //             })
    //         }
    //     });
    // },

    // addBannerImages : (bannerId, imgUrl)=>{
    //     return new Promise((resolve, reject)=>{
    //         db.get().collection(collection.BANNERS).updateOne({_id:new ObjectId(bannerId)}, 
    //         {
    //             $set:{
    //                 image: imgUrl
    //             }
    //         }).then((data)=>{
    //             resolve(data)
    //         })

    //     })
    // },

    addBanner: (bannerDetails) => {
        return new Promise(async (resolve, reject) => {
            // let bannerExist = await db.get().collection(collection.BANNERS).findOne({
            //     title: { $regex: `^${bannerDetails.title}$`, $options: 'i' }
            // });

            // if (bannerExist) {
            //     reject(new Error('This banner already exists...!'));
            // } else {
            bannerDetails.status = true;
            db.get().collection(collection.BANNERS).insertOne(bannerDetails)
                .then((data) => {
                    resolve(data.insertedId);
                })
                .catch((error) => {
                    reject(error);
                });
            // }
        });
    },

    addBannerImages: (bannerId, imgUrl) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNERS).updateOne(
                { _id: new ObjectId(bannerId) },
                { $set: { image: imgUrl } }
            )
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },

    getBanners: () => {
        return new Promise(async (resolve, reject) => {
            let banner = await db.get().collection(collection.BANNERS).find().toArray()
            console.log(banner, "bannersss ");
            resolve(banner)
        })

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
        orderId = new ObjectId(orderId)
        console.log(orderId, "fgjghihij");
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

    getOrderCount: async () => {
        let orderCount = await db.get().collection(collection.ORDERS).countDocuments()
        return orderCount
    },

    getTotalRevenue: async () => {
        let total = await db.get().collection(collection.ORDERS).aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalPrice" } // Calculate the sum of the "amount" field
                }
            },
            {
                $project: {
                    _id: 0,
                    "total": '$totalAmount'
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
    ,

    getSaleStatistics: () => {
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
    },

    doUnlistBanner: (bannerId) => {
        return new Promise(async (resolve, reject) => {
            console.log('wroking');
            await db.get().collection(collection.BANNERS).updateOne({ _id: new ObjectId(bannerId) }, { $set: { status: true } }).then((response) => {
                resolve(response)
            })
        })
    },

    doListBanner: (bannerId) => {
        return new Promise(async (resolve, reject) => {
            // console.log('wrokinhhhhg');
            await db.get().collection(collection.BANNERS).updateOne({ _id: new ObjectId(bannerId) }, { $set: { status: false } }).then((response) => {
                resolve(response)
            })
        })
    },

    addOfferPrice: async (data) => {
        return new Promise(async (resolve, reject) => {
            const category = data.category;
            const offer = parseInt(data.offer);
            console.log(category, offer, "category, offer,");

            await db.get().collection(collection.PRODUCTS_COLLECTION).updateMany(
                { category: category },
                { $set: { offer: offer} }
            ).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });
    },

    addProductOffPrice :async (data)=>{
       
        return new Promise(async (resolve, reject) => {
            let proId= data.products
        let offer = parseInt(data.offer);
        console.log(proId, offer, "proId and offer price in admin helpers fo pro offer");

            await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                { _id: new ObjectId(proId) },
                { $set: { offer: offer} }
            ).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });
    },


    deactivateOffPrice :async (data)=>{
       
        return new Promise(async (resolve, reject) => {
            // let proId= data._id
        // let offer = parseInt(data.offer);
        console.log(data,  "proId and offer price in admin helpers fo pro offer");
            await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                { _id: new ObjectId(data) },
                { $set: { offer: 0} }
            ).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });
    },

    deactivateCategoryOffer :async (data)=>{
        return new Promise(async (resolve, reject) => {
            const category = data.category;
            // const offer = parseInt(data.offer);
            console.log(category,  "category off deatvivate");

            await db.get().collection(collection.PRODUCTS_COLLECTION).updateMany(
                { category: category },
                { $set: { offer: 0} }
            ).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });
    },

        






}


    




