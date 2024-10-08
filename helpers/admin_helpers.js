let db = require("../config/connection")
let collection = require('../config/collections')
const { PRODUCTS_COLLECTION } = require("../config/collections")
const { ObjectId } = require("mongodb")
// const { orderDetails } = require("../controllers/user_controllers")

 
module.exports = {
    addProduct: (productData, callback) => {
        try {
            productData.status = true
            productData.date = new Date()
            productData.offer = 0
            productData.reviews = []
            productData.price = parseInt(productData.price)
            productData.stock = parseInt(productData.stock)
            db.get().collection(collection.PRODUCTS_COLLECTION).insertOne(productData).then((data) => {

                callback(data.insertedId)
            })

        } catch (error) {
            res.render('error', { error });
        }

    },
    addProductImages: (proId, imgUrl) => {
        try {
            return new Promise(async (resolve, reject) => {
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

        } catch (error) {
            res.render('error', { error });
        }
    },

    addBanner: (bannerDetails) => {
        try {
            return new Promise(async (resolve, reject) => {
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

        } catch (error) {
            res.render('error', { error });
        }
    },

    addBannerImages : (bannerId, imgUrl) => {

        try {
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

        } catch (error) {
            res.render('error', { error });
        }
    },

    getBanners: () => {
        try {
            return new Promise(async (resolve, reject) => {
                let banner = await db.get().collection(collection.BANNERS).find().toArray()
                resolve(banner)
            })

        } catch (error) {
            res.render('error', { error });
        }

    },



    editProductDetails: (proId, productdetails) => {
        try {
            return new Promise((res, rej) => {
                db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({ _id: new ObjectId(proId) },
                    {
                        $set: {
                            name: productdetails.name,
                            description: productdetails.description,
                            price: parseInt(productdetails.price),
                            stock: parseInt(productdetails.stock),

                        }
                    }).then((response) => {
                        res(response)
                    })
            })

        } catch (error) {
            res.render('error', { error });
        }

    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            products = await db.get().collection(collection.PRODUCTS_COLLECTION).find().toArray()
            resolve(products)
        })
        try {

        } catch (error) {
            res.render('error', { error });
        }
    },


    blockUser: (userId) => {
        try {
            return new Promise(async (resolve, reject) => {
                await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(userId) }, { $set: { status: false } })
                    .then((response) => {
                        resolve(response)
                    })

            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    unblockUser: (userId) => {
        try {
            return new Promise(async (resolve, reject) => {
                await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(userId) }, { $set: { status: true } })
                    .then((response) => {
                        resolve(response)
                    })
            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    viewAllCategories: () => {
        try {
            return new Promise(async (resolve, reject) => {
                category = await db.get().collection(collection.PRODUCTS_CATEGORY).find().toArray()
                resolve(category)
            })

        } catch (error) {
            res.render('error', { error });
        }
    },


    getCategoryCount: () => {
        try {
            return new Promise(async (resolve, reject) => {
                let category = await db.get().collection(collection.PRODUCTS_CATEGORY).find({ status: true }).toArray()
                resolve(category?.length)

            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    getProductCount: () => {
        try {
            return new Promise(async (resolve, reject) => {
                let productsCount = await db.get().collection(collection.PRODUCTS_COLLECTION).countDocuments({ status: true })
                resolve(productsCount)
            })

        } catch (error) {
            res.render('error', { error });
        }

    },

    getOrderCount: async () => {
        try {
            let orderCount = await db.get().collection(collection.ORDERS).countDocuments()
            return orderCount

        } catch (error) {
            res.render('error', { error });
        }
    },

    getTotalRevenue: async () => {

        try {
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
            return total

        } catch (error) {
            res.render('error', { error });
        }

    },

    getOrderStatistics: () => {
        try {
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


    }
    ,

    getSaleStatistics: () => {
        try {
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

    doUnlistBanner: (bannerId) => {
        try {
            return new Promise(async (resolve, reject) => {
                await db.get().collection(collection.BANNERS).updateOne({ _id: new ObjectId(bannerId) }, { $set: { status: true } }).then((response) => {
                    resolve(response)
                })
            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    doListBanner: (bannerId) => {
        try {
            return new Promise(async (resolve, reject) => {
                await db.get().collection(collection.BANNERS).updateOne({ _id: new ObjectId(bannerId) }, { $set: { status: false } }).then((response) => {
                    resolve(response)
                })
            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    addOfferPrice: async (data) => {
        return new Promise(async (resolve, reject) => {
            const category = data.category;
            const offer = parseInt(data.offer);
            await db.get().collection(collection.PRODUCTS_COLLECTION).updateMany(
                { category: category },
                { $set: { offer: offer } }
            ).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });

    },
 
    addProductOffPrice: async (data) => {

        return new Promise(async (resolve, reject) => {
            let proId = data.products
            let offer = parseInt(data.offer);
            await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                { _id: new ObjectId(proId) },
                { $set: { offer: offer } }
            ).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });

    },


    deactivateOffPrice: async (data) => {


        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                { _id: new ObjectId(data) },
                { $set: { offer: 0 } }
            ).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });


    },

    deactivateCategoryOffer: async (data) => {

        return new Promise(async (resolve, reject) => {
            const category = data.category;
            await db.get().collection(collection.PRODUCTS_COLLECTION).updateMany(
                { category: category },
                { $set: { offer: 0 } }
            ).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });

    },








}







