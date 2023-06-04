let collection = require('../config/collections')
let db = require("../config/connection")
const bcrypt = require("bcrypt")
const { sendSms, sendSmsChecking } = require('../twilio')
const { ObjectId } = require("mongodb")
const collections = require('../config/collections')
require('dotenv').config();
const Razorpay = require('razorpay')
const instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});





module.exports = {
    getUser: (userId) => {


        try {
            return new Promise(async (resolve, reject) => {
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                    _id: new ObjectId(userId)
                })
                resolve(user)
            })

        } catch (error) {
            res.render('error', { error });
        }
    },
    doSignup: function (userData) {
        try {
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
                    userData.wallet = 0
                    userData.password = await bcrypt.hash(userData.password, 10);
                    db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(function (data) {
                        resolve({ status: true, userData });
                    });
                }
            });

        } catch (error) {
            res.render('error', { error });
        }
    },



    doLogin: (userData) => {
        try {
            return new Promise(async (resolve, reject) => {
                let loginStatus = false
                let response = {}
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
                if (user) {
                    if (user.status) {
                        bcrypt.compare(userData.password, user.password).then((passCheck) => {
                            if (passCheck) {
                                response.user = user
                                response.status = true
                                resolve(response)
                            } else {
                                resolve({ status: false, message: "Password is incorrect..!" })
                            }
                        })
                    } else {
                        resolve({ status: false, message: " You were blocked..!" })
                    }
                } else {
                    resolve({ status: false, message: "User not found..." })
                }
            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    getOneProduct: (proId) => {
        try {
            return new Promise((resolve, reject) => {
                db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: ObjectId(proId) }).then((products) => {
                    resolve(products)
                })
            })

        } catch (error) {
            res.render('error', { error });
        }
    },
    checkUserOTP: (mobNo) => {
        try {
            return new Promise(async (resolve, reject) => {
                if (mobNo.phone) {
                    let userData = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: mobNo.phone, })
                    if (userData) {
                        resolve(userData)
                    } else {
                        userData = null
                        resolve(userData);
                    }
                }
            })

        } catch (error) {
            res.render('error', { error });
        }
    },


    doSendOtp: (mobNo) => {
        try {
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

        } catch (error) {
            res.render('error', { error });
        }
    },

    doVerifyOtp: (otp, phone) => {
        try {
            return new Promise(async (resolve, reject) => {
                if (otp.otp && phone) {
                    let sendSms = await sendSmsChecking(otp.otp, phone)
                    let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: phone })
                    resolve({ sendSms, user })
                } else {
                    resolve(false)
                }
            })

        } catch (error) {
            res.render('error', { error });
        }

    },


    findAllUser: async (skip, pageSize) => {
        try {
            const allUser = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            return allUser

        } catch (error) {
            res.render('error', { error });
        }
    },

    findUserCount: async () => {
        try {
            const count = await db.get().collection(collection.USER_COLLECTION).countDocuments();
            return count

        } catch (error) {
            res.render('error', { error });
        }

    },



    /////////////////////// password recovery ///////////////////////

    checkForUser: async (mobile) => {

        try {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: mobile })
            if (user) {
                return user
            } else {
                user = null
                return user
            }

        } catch (error) {
            res.render('error', { error });
        }

    },

    verifyOtpForForgotPass: (otp, phone) => {
        try {
            return new Promise(async (resolve, reject) => {
                if (otp.otp && phone) {
                    let sendSms = await sendSmsChecking(otp.otp, phone)
                    let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: phone })
                    resolve({ sendSms, user })
                } else {
                    resolve(false)
                }
            })

        } catch (error) {
            res.render('error', { error });
        }

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
            } catch (error) {
                res.render('error', { error });
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
                        resolve(response);
                    })
            } catch (err) {
                reject();
            }

        })
    },




    getTotalAmount: (userId) => {

        try {
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
                resolve(total)
            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    getOfferAmount: (userId) => {
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
                        total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.offer' }] } }
                    }
                }
            ]).toArray()
            try {
                resolve(total)
            } catch {
                resolve(total = 0)
            }
        })
    },

    addNewAddress: (addressData, userId) => {
        try {
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

        } catch (error) {
            res.render('error', { error });
        }
    },

    findUserId: (userId) => {
        try {
            return new Promise(async (resolve, rej) => {
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(userId) })
                resolve(user)
            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    getUserAddress: (userId, addressId) => {

        try {
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

        } catch (error) {
            res.render('error', { error });
        }
    },

    getCartList: (userId) => {
        try {
            return new Promise(async (res, rej) => {
                let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
                res(cart.products)
            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    placeOrder: (order, products, grandTotal, payment, userId, couponDiscount) => {
        try {
            return new Promise((res, rej) => {
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
                    orderstatus: 'placed',
                    totalPrice: grandTotal,
                    date: Date.now(),
                    discount : couponDiscount
                    
                }

                db.get().collection(collection.ORDERS).insertOne(orderObj).then((response) => {
                    db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(userId) })
                    res(response.insertedId)
                })

            })

        } catch (error) {
            res.render('error', { error });
        }
    },


    generateRazorpay: (orderId, total) => {

        try {
            return new Promise((res, rej) => {
                var options = {
                    amount: total * 100,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: "" + orderId
                };
                instance.orders.create(options, function (err, order) {
                    if (err) {
                    } else {
                        res(order)
                    }
                });
            })

        } catch (error) {
            res.render('error', { error });
        }

    },

    verifyPayment: (details) => {
        try {
            return new Promise(async (res, rej) => {
                const {
                    createHmac,
                } = await import('node:crypto');
                let hmac = createHmac('sha256', process.env.KEY_SECRET);

                hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
                hmac = hmac.digest('hex')
                if (hmac == details['payment[razorpay_signature]']) {
                    res()
                } else {
                    rej()
                }
            })

        } catch (error) {
            res.render('error', { error });
        }

    },

    changePaymentStatus: async (orderId) => {
        try {
            let result = await db.get().collection(collection.ORDERS)
                .updateOne(
                    {
                        _id: ObjectId(orderId)
                    },
                    {
                        $set: {
                            status: 'placed'
                        }
                    })
            return result

        } catch (error) {
            res.render('error', { error });
        }
    },

    GetUserDetails: async (userId) => {
        try {
            const user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(userId) })
            return user

        } catch (error) {
            res.render('error', { error });
        }
    },

    UpdateProfileInfo: (userId, userData) => {
        try {
            userData.phone = Number(userData.phone);
            return new Promise((resolve, reject) => {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(userId) },
                    {
                        $set: {
                            name: userData.name,
                            email: userData.email,
                            mobile: userData.phone
                        }
                    }).then((response) => {
                        resolve()
                    })
            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    findUser: (userId) => {
        try {
            return new Promise(async (resolve, reject) => {
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(userId) })
                resolve(user);
            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    removeAddress: (addressId, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: new ObjectId(userId),
                "address._id": new ObjectId(addressId)
            },
                {
                    $pull: {
                        address: {
                            _id: new ObjectId(addressId)
                        }
                    }
                }).then((response) => {
                    resolve()
                }).catch((error) => {
                    res.render('error', { error });

                })
               
        })

    },

    doGetUser: async (userId) => {
        try {
            let user = await db.get().collection(collection.USER).find({ _id: ObjectId(userId) }).toArray()
            return user

        } catch (error) {
            res.render('error', { error });
        }
    },

    getBanner: async () => {
        try {
            let banner = await db.get().collection(collection.BANNERS).find({ status: true }).toArray()
            return banner

        } catch (error) {
            res.render('error', { error });
        }
    },

    doapplyCoupon: async (couponCode, userId) => {
        try {
            let checkCoupon = await db.get().collection(collection.COUPONS).find({ couponCode: couponCode }).toArray()
            if (checkCoupon.length > 0) {
                let today = new Date()
                let expiryDate = new Date(checkCoupon[0].expiryDate)
                let user = await db.get().collection(collection.COUPONS).aggregate([
                    {
                        $match: { couponCode: couponCode }
                    },
                    {
                        $match: { user: { $in: [ObjectId(userId)] } }
                    }
                ]).toArray();

                if (user.length == 0) {
                    if (expiryDate >= today) {
                        db.get().collection(collection.COUPONS).updateOne({ couponCode: couponCode }, { $push: { user: new ObjectId(userId) } })
                        let discount = checkCoupon[0].discount;
                        return ({ status: true, discount })
                    } else {
                        return (false)
                    }
                } else {
                    return (false);
                }
            } else {
                return (false);
            }

        } catch (error) {
            res.render('error', { error });
        }

    },


    getCoupon: async (couponCode) => {
        try {
            let Coupon = await db.get().collection(collection.COUPONS).find({ couponCode: couponCode }).toArray()
            return Coupon

        } catch (error) {
            res.render('error', { error });
        }
    },


    stockDecrement: async (products) => {
        try {
            for (let i = 0; i < products.length; i++) {
                await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({
                    _id: products[i].item
                },
                    {
                        $inc: {
                            stock: -(products[i].quantity)
                        }
                    })
            }

        } catch (error) {
            res.render('error', { error });
        }
    },

    incrementStock: async (products) => {
        try {
            for (let i = 0; i < products.length; i++) {
                await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                    {
                        _id: products[i].item
                    },
                    {
                        $inc: {
                            stock: products[i].quantity
                        }
                    })
            }

        } catch (error) {
            res.render('error', { error });
        }
    },



    incWallet: async (userId, amount) => {
        try {
            await db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: new ObjectId(userId)
            }, {
                $inc: {
                    wallet: amount
                }
            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    decWallet: async (userId, amount) => {
        try {
            await db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: new ObjectId(userId)
            }, {
                $inc: {
                    wallet: -(amount)
                }
            })

        } catch (error) {
            res.render('error', { error });
        }
    },

    totalAmount: async (orderId) => {
        try {
            let total = await db.get().collection(collection.ORDERS).aggregate([
                {
                    '$match': {
                        '_id': ObjectId(orderId)
                    }
                },
                {
                    '$group': {
                        '_id': null,
                        'totalPrice': { $sum: '$totalPrice' }
                    }
                },
                {
                    '$project': {
                        '_id': 0,
                        'totalPrice': 1
                    }
                }
            ]).toArray()
            return total[0].totalPrice

        } catch (error) {
            res.render('error', { error });
        }

    },

    orderUser: async (orderId) => {

        try {
            let user = await db.get().collection(collection.ORDERS)
                .aggregate([
                    {
                        '$match': {
                            '_id': ObjectId(orderId)
                        }
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'userId': 1
                        }
                    }
                ]).toArray()
            return user[0].userId

        } catch (error) {
            res.render('error', { error });
        }
    },


    updateAddress: (userId, data, addressId) => {
        try {
            return new Promise((resolve, reject) => {
                db.get().collection(collection.USER_COLLECTION).updateOne(
                    {
                        _id: new ObjectId(userId),
                        address: { $elemMatch: { _id: new ObjectId(addressId) } }
                    },
                    {
                        $set: {
                            "address.$.name": data.name,
                            "address.$.phone": data.phone,
                            "address.$.city": data.city,
                            "address.$.pincode": data.pincode,
                            "address.$.district": data.district,
                            "address.$.housename": data.housename,
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



