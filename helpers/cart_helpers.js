let db = require("../config/connection")
let collection = require('../config/collections')
const { ObjectId } = require("mongodb")



module.exports={

    doAddToCart: (proId, userId) => {
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            if (userCart) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId) },
                    {
                        $push: { products: ObjectId(proId) }
                    }).then((response) => {
                        resolve(response)
                    })
            } else {
                let cartObj = {
                    user: ObjectId(userId),
                    products: [ObjectId(proId)],
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve(response)
                })
    
            }
        })
    },
    getCartProducts : async (userId)=>{
        let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match:{user:ObjectId(userId)}
            },
            {
                $lookup:{
                    from: collection.PRODUCTS_COLLECTION,
                    let : {proLists :"$products"},
                    pipeline :[
                        {
                            $match :{
                                $expr :{
                                    $in:["$_id", "$$proLists"]
                                }
                            }
                        }
                    ],
                    as: "cartItems" 
                }
            }
        ]).toArray()
        // console.log("cartiiiiiiiiiiiiii", cartItems, "cartitems is get !!!!");
        return cartItems[0].cartItems
    },




}
