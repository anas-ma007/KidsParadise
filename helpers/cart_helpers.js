let db = require("../config/connection")
let collection = require('../config/collections')
const { ObjectId } = require("mongodb")
// const { productDetails } = require("../controllers/user_controllers")rs



module.exports = {

  doAddToCart: (proId, userId) => {
    try{
      let proObj = {
        item: ObjectId(proId),
        quantity: 1
      }
      return new Promise(async (res, rej) => {
        let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
        if (userCart) {
          let proExist = userCart.products.findIndex(product => product.item == proId)
          console.log(proExist);
          if (proExist != -1) {
            db.get().collection(collection.CART_COLLECTION)
              .updateOne({ user: ObjectId(userId), 'products.item': ObjectId(proId) },
                {
                  $inc: { 'products.$.quantity': 1 }
                }).then(() => {
                  res()
                })
          } else {
            await db.get().collection(collection.CART_COLLECTION).updateOne
              (
                {
                  user: ObjectId(userId)
                },
                {
                  $push: { products: proObj }
                }
              ).then((response) => {
                res()
              })
          }
  
        } else {
          let cartObj = {
            user: ObjectId(userId),
            products: [proObj]
          }
          await db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
            res()
          })
        }
      })

    } catch (error) {
      res.render('error', { error });
  }
  },

  getCartProducts: async (userId) => {
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
            '_id': 1,
            'products.quantity': 1,
            'productsDetails': 1
          }
        }
      ]).toArray()
    try {
      cartItems.forEach(item => {
        item.productsDetails[0].quantity = item.products.quantity;
        delete item['products'];
      })

      return cartItems;
    } catch {
      cartItems = null;
      return null;
    }
  },



  changeProductQuantity: (details) => {    
    try{
      details.count = parseInt(details.count)
      details.quantity = parseInt(details.quantity)
  
      return new Promise((res, rej) => {
        if (details.count == -1 && details.quantity == 1) {
          db.get().collection(collection.CART_COLLECTION)
            .updateOne({ _id: ObjectId(details.cart) },
              {
                $pull: { products: { item: ObjectId(details.product) } }
              }
            ).then((response) => {
              res({ removeProduct: true })
            })
        } else {
          db.get().collection(collection.CART_COLLECTION)
            .updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) },
              {
                $inc: { 'products.$.quantity': details.count }
              }
            ).then((response) => {
              res(response)
            })
        }
      })

    } catch (error) {
      res.render('error', { error });
  }
  },

  removeProductCart: (details) => {
    
    try{
      return new Promise((resolve, reject) => {
        db.get().collection(collection.CART_COLLECTION)
          .updateOne({ _id: ObjectId(details.cart) },
            {
              $pull: { products: { item: ObjectId(details.product) } }
            }
          ).then((response) => {
            resolve({ removeProduct: true })
          }
          )
      })

    } catch (error) {
      res.render('error', { error });
  }
  },








}
