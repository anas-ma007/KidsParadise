let db = require("../config/connection")
let collection = require('../config/collections')
const { ObjectId } = require("mongodb")
const { productDetails } = require("../controllers/user_controllers")



module.exports={

    // doAddToCart: (proId, userId) => {
    //     return new Promise(async (resolve, reject) => {
    //         let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
    //         if (userCart) {
    //             db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId) },
    //                 {
    //                     $push: { products: ObjectId(proId) }
    //                 }).then((response) => {
    //                     resolve(response)
    //                 })
    //         } else {
    //             let cartObj = {
    //                 user: ObjectId(userId),
    //                 products: [ObjectId(proId)],
    //             }
    //             db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
    //                 resolve(response)
    //             })
    
    //         }
    //     })
    // },
   doAddToCart: (proId,userId)=>{
        let proObj={
            item:ObjectId(proId),
            quantity:1
        }
        return new Promise(async(res,rej)=>{
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            if(userCart){
                let proExist = userCart.products.findIndex(product=> product.item==proId)
                console.log(proExist);
                if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:ObjectId(userId),'products.item':ObjectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }).then(()=>{
                        res()
                    })
                }else{
                    await db.get().collection(collection.CART_COLLECTION).updateOne
                    (
                        {
                            user:ObjectId(userId)
                        },
                        {
                            $push:{products:proObj}
                        }
                    ).then((response)=>{
                        res()
                    })
                }
                
            }else{
                let cartObj={
                    user:ObjectId(userId),
                    products:[proObj]
                }
                await db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    res()
                })
            }
        })
      },

    getCartProducts : async (userId)=>{
        let cartItems = await db.get().collection(collection.CART_COLLECTION)
        .aggregate([
            {
              '$match': {
                'user': ObjectId(userId)
              }
            }, {
              '$unwind': {
                'path': '$products', 
                'preserveNullAndEmptyArrays': true
              }
            }, {
              '$lookup': {
                'from': 'product', 
                'localField': 'products.item', 
                'foreignField': '_id', 
                'as': 'productsDetails'
              }
            }, {
              '$project': {
                '_id': 0, 
                'products.quantity': 1, 
                'productsDetails': 1
              }
            }
          ]).toArray()
        cartItems.forEach(item=>{
            item.productsDetails[0].quantity = item.products.quantity;
            delete item['products'];
        })
        console.log(cartItems);
        console.log(cartItems);
        return cartItems;
    },




     //////////////akhilede code
    // (userId) => {
    //     return new Promise(async (resolve, reject) => {
    //       console.log("");
    //       try {
    //         userId = new ObjectId(userId);
    //         let cartItems = await db.get().collection(collection.CART_COLLECTION)
    //         .aggregate([
    //             {
    //               '$match': {
    //                 'userId': userId
    //               }
    //             }, {
    //               '$unwind': {
    //                 'path': '$products', 
    //                 'preserveNullAndEmptyArrays': true
    //               }
    //             }, {
    //               '$lookup': {
    //                 'from': 'product', 
    //                 'localField': 'products.productId', 
    //                 'foreignField': '_id', 
    //                 'as': 'proDetails'
    //               }
    //             }, {
    //               '$project': {
    //                 'proDetails': 1, 
    //                 'products.quantity': 1, 
    //                 '_id': 0
    //               }
    //             }
    //           ]).toArray();
    //         console.log(cartItems)
    //         console.log("cartitms .length consooooolleeee",cartItems.length);
    //         if(cartItems.length!=0){
    //             if(cartItems.length===1){
    //                 if(cartItems[0].proDetails.length===0){
    //                     console.log("tst after cartItems[0].proDetails.length===0 ")
    //                     console.log(`prodetailslength : ${cartItems[0].proDetails.length}`);
    //                     resolve(null);
    //                 }
    //             }
    //             resolve(cartItems)
    //         }else{
    //             resolve(null);
    //         }
    //       } catch {
    //         resolve(null);
    //         }
    //     });
    //   }







}
