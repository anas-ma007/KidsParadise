let collection = require('../config/collections')
let db = require("../config/connection")
const bcrypt = require("bcrypt")
const { sendSms, sendSmsChecking } = require('../twilio')
const { ObjectId } = require("mongodb")
const collections = require('../config/collections')
require('dotenv').config();

// const { sendotp } = require('../controllers/user_controllers')
// const { response } = require('../app')
const Razorpay = require('razorpay')
const instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});





module.exports = {
    getUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                _id: new ObjectId(userId)
            })
            resolve(user)
        })
    },
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
                userData.wallet = 0
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
            // console.log("total[0].total is=>", total[0].total, " total is=>", total);
            resolve(total)
        })
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
            try{
                console.log("total[0].total offer price is=>", total[0].total, " total offer price is=>", total);
                resolve(total)
            }catch{
                resolve(total=0)
            }
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


    generateRazorpay: (orderId, total) => {
        return new Promise((res, rej) => {
            var options = {
                amount: total * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(order);
                    res(order)
                }
            });
        })

    },

    verifyPayment: (details) => {
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

    },

    changePaymentStatus: async (orderId) => {
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
    },

    GetUserDetails: async (userId) => {
        const user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(userId) })
        return user
    },

    UpdateProfileInfo:(userId,userData)=>{
        userData.phone = Number(userData.phone);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id: new ObjectId(userId)},
            {
                $set:{
                    name:userData.name,
                    email:userData.email,
                    mobile:userData.phone
                }
            }).then((response)=>{
                console.log(response,"11111111111111111111333333333355555555557777777777");
                resolve()
            })
        })
    },

    findUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(userId) })
            resolve(user);
        })
    },

    removeAddress: (addressId, userId) => {
        console.log(addressId, userId, "addresid, userid");
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
                    console.log("adddresss removedddd?????");
                    resolve()
                }).catch((err) => {
                    console.log(err);
                })

        })

    },

    doGetUser: async (userId) => {
        let user = await db.get().collection(collection.USER).find({ _id: ObjectId(userId) }).toArray()
        return user
    },

    getBanner: async () => {
        let banner = await db.get().collection(collection.BANNERS).find({ status: true }).toArray()
        // console.log(banner, "banner for user home page in user helper function");
        return banner
    },

    doapplyCoupon: async (couponCode, userId) => {
        // console.log(couponCode, userId, total, " couponCode, userId, total");
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
                    console.log("coupon expiredddd");
                    return (false)
                }
            } else {
                console.log("user found -----");
                return (false);
            }
        } else {
            console.log("invalid code -----");
            return (false);
        }

    },


    getCoupon: async (couponCode) => {
        let Coupon = await db.get().collection(collection.COUPONS).find({ couponCode: couponCode }).toArray()
        // console.log(Coupon , "soorajj logg coupon")
        return Coupon
    },


    stockDecrement: async (products) => {
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
    },

    incrementStock: async (products) => {
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
    },



    incWallet: async (userId, amount) => {
        await db.get().collection(collection.USER_COLLECTION).updateOne({
            _id: new ObjectId(userId)
        }, {
            $inc: {
                wallet: amount
            }
        })
    },

    decWallet: async (userId, amount) => {
        // console.log(userId, amount, "userId and amount in decermnt wallet in user helpers");
        await db.get().collection(collection.USER_COLLECTION).updateOne({
            _id: new ObjectId(userId)
        }, {
            $inc: {
                wallet: -(amount)
            }
        })
    },

    totalAmount: async (orderId) => {
        console.log(orderId, "order iidddd");
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

        console.log(total, "total in return product confrim user helpers");
        return total[0].totalPrice

    },

    orderUser: async (orderId) => {
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
    },



}



