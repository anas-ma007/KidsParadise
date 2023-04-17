let collection = require('../config/collections')
let db = require("../config/connection")
const bcrypt = require("bcrypt")
const { sendSms, sendSmsChecking } = require('../twilio')
const { ObjectId } = require("mongodb")
// const { sendotp } = require('../controllers/user_controllers')
// const { response } = require('../app')




module.exports = {
    doSignup: function (userData) {
        userData.status = true
        return new Promise(async function (resolve, reject) {
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(function (data) {
                resolve(data)
            })
        })
    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user && user.status) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("Login Success");
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("Login Error");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("No user available");
                resolve({ status: false })
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

    doSendOtp: (mobNo) => {
        return new Promise(async (resolve, reject) => {
            if (mobNo.phone) {
                let userData = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: mobNo.phone })
                if (userData) {
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
        const allUser = await db.get().collection(collection.USER_COLLECTION).find().skip(skip).limit(pageSize).toArray()
        return allUser
    },

    findUserCount: async () => {
        const count = await db.get().collection(collection.USER_COLLECTION).countDocuments();
        return count

    },

    /////////////////////// password recovery ///////////////////////

    checkForUser: async (mobile) => {
        let user = await db.get().collection(collection.USER_COLLECTION).findone({mobile : mobile})
        if(user){
            return user
        }else {
            user=null
            return user
        }

    },

    // sendOtpForForgotPass: (mobNo) => {
    //     return new Promise(async (resolve, reject) => {
    //         if (mobNo.phone) {
    //             let userData = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: mobNo.phone })
    //             if (userData) {
    //                 this.doSendOtp(mobNo)
    //             }
    //         }
    //     })
                    
        //             sendSms(mobNo.phone)
        //             resolve(true)
        //         } else {
        //             resolve(false)
        //         }
        //     } else {
        //         resolve(false)
        //     }
        // })
   // },


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

    // ///////////////// password recover 













}