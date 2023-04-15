let db = require("../config/connection")
let collection = require('../config/collections')
const { PRODUCTS_COLLECTION } = require("../config/collections")
// const { Collection, ObjectID } = require('mongodb');
// var objectId = require('mongodb').ObjectID
const { ObjectId } = require("mongodb")


module.exports = {
    addProduct: (productData, callback) => {
        productData.status = true
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
                        price: productdetails.price,
                        stock: productdetails.stock,
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



}