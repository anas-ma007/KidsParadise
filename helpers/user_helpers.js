let collection = require('../config/collections')
let db = require("../config/connection")
const bcrypt = require("bcrypt")
const { sendSms, sendSmsChecking } = require('../twilio')
const { ObjectId } = require("mongodb")
const collections = require('../config/collections')
// const { sendotp } = require('../controllers/user_controllers')
// const { response } = require('../app')




module.exports = {
    doSignup: function (userData) {
        return new Promise(async function (resolve, reject) {
            let mobileExist = await db.get().collection(collection.USER_COLLECTION).findOne({
                mobile: userData.mobile
            });
            let emailExist = await db.get().collection(collection.USER_COLLECTION).findOne({
                email: userData.email
            });

            if (mobileExist) {
                resolve({ status: false, message: "This mobile number is already regsitered with another account..!" });
            } else if (emailExist) {
                resolve({ status: false, message: "This Email is already regsitered with another account..!" });
            } else {
                userData.status = true;
                userData.password = await bcrypt.hash(userData.password, 10);
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(function (data) {
                    resolve({ status: true, userData });
                });
            }
        });
    },



    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                if (user.status) {
                    bcrypt.compare(userData.password, user.password).then((passCheck) => {
                        if (passCheck) {
                            console.log("Login Success");
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            console.log("password error");
                            resolve({ status: false, message: "Password is incorrect..!" })
                        }
                    })
                } else {
                    console.log("user blocked");
                    resolve({ status: false, message: " You were blocked..!" })
                }
            } else {
                console.log("user not found !!!");
                resolve({ status: false, message: "User not found..." })
            }
        })
    },

    getOneProduct: (proId) => {
        // console.log(proId);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: ObjectId(proId) }).then((products) => {
                // console.log(products);
                resolve(products)
            })
        })
    },
    checkUserOTP: (mobNo) => {
        return new Promise(async (resolve, reject) => {
            if (mobNo.phone) {
                let userData = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: mobNo.phone, })
                if (userData) {
                    resolve(userData)
                    // if(userData.status){
                    //     resolve(userData)
                    // } else {
                    //     resolve({status: false, message:"You were blocked"})
                    // }

                } else {
                    userData = null
                    resolve(userData);
                }
            }
        })
    },


    doSendOtp: (mobNo) => {
        return new Promise(async (resolve, reject) => {
            if (mobNo.phone) {
                let userData = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: mobNo.phone, })
                if (userData && userData.status) {
                    sendSms(mobNo.phone)
                    resolve(true)
                } else {
                    resolve(false)
                }
            } else {
                resolve(false)
            }
        })
    },

    doVerifyOtp: (otp, phone) => {
        return new Promise(async (resolve, reject) => {
            if (otp.otp && phone) {
                let sendSms = await sendSmsChecking(otp.otp, phone)
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: phone })
                resolve({ sendSms, user })
            } else {
                resolve(false)
            }
        })

    },


    findAllUser: async (skip, pageSize) => {
        const allUser = await db.get().collection(collection.USER_COLLECTION).find().toArray()
        return allUser
    },

    findUserCount: async () => {
        const count = await db.get().collection(collection.USER_COLLECTION).countDocuments();
        return count

    },

    /////////////////////// password recovery ///////////////////////

    checkForUser: async (mobile) => {
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: mobile })
        if (user) {
            return user
        } else {
            user = null
            return user
        }

    },

    verifyOtpForForgotPass: (otp, phone) => {
        return new Promise(async (resolve, reject) => {
            if (otp.otp && phone) {
                let sendSms = await sendSmsChecking(otp.otp, phone)
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: phone })
                resolve({ sendSms, user })
            } else {
                resolve(false)
            }
        })

    },


    newPasswordUpdate: (userId, password) => {
        return new Promise(async (resolve, reject) => {
            try {
                password.password = await bcrypt.hash(password.password, 10);
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(userId) },
                    {
                        $set: {
                            password: password.password
                        }
                    }).then((response) => {
                        resolve(response)
                    })
            } catch (err) {
                console.log(err);
            }
        })
    },
    setNewPass: (userId, newPass) => {
        return new Promise(async (resolve, reject) => {
            try {
                newPass = await bcrypt.hash(newPass, 10);
                db.get().collection(collections.USER_COLLECTION)
                    .updateOne(
                        {
                            _id: new ObjectId(userId)
                        },
                        {
                            $set: {
                                password: newPass
                            }
                        }
                    )
                    .then((response) => {
                        console.log(response);
                        resolve(response);
                    })
            } catch (err) {
                console.log(err);
                reject();
            }
        })
    },
    // ///////////////// password recover 

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
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
                        from: 'product',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },

                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ["$product", 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.price' }] } }
                    }
                }
            ]).toArray()

            // console.log(total[0].total, "total from get total amount fn");
            resolve(total)
        })
    },

    updateAddress: (addressData, userId) => {
        return new Promise((resolve, rej) => {
            addressData._id = new ObjectId()
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(userId) },
                {
                    $push: {
                        address: addressData
                    }
                }).then((response) => {
                    resolve(response)
                })
        })
    },

    findUserId: (userId) => {
        return new Promise(async (resolve, rej) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(userId) })
            resolve(user)
        })
    },

    getUserAddress: (userId, addressId) => {
        return new Promise(async (resolve, reject) => {
            userId = new ObjectId(userId);
            addressId = new ObjectId(addressId);
            const address = await db.get().collection(collection.USER_COLLECTION)
                .findOne(
                    {
                        _id: userId,
                        address: { $elemMatch: { _id: addressId } }
                    },
                    {
                        projection: {
                            _id: 0,
                            'address.$': 1
                        }
                    }
                )
            resolve(address.address[0]);
        })
    },

    getCartList: (userId) => {
        return new Promise(async (res, rej) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            res(cart.products)
        })
    },

    placeOrder: (order, products, grandTotal, payment, userId) => {
        return new Promise((res, rej) => {
            // let status = order.paymentMethod === 'Cash on delivery' ? 'placed' : 'pending'
            let orderObj = {
                deliveryAddress: {
                    name: order.name,
                    address: order.housename,
                    city: order.city,
                    district: order.district,
                    pincode: order.pincode,
                    mobile: order.phone
                },
                userId: ObjectId(userId),
                paymentmethod: payment,
                products: products,
                // status: status,
                orderstatus: 'placed',
                totalPrice: grandTotal,
                date: Date.now()
            }

            db.get().collection(collection.ORDERS).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(userId) })
                res(response.insertedId)
            })

        })
    },

}