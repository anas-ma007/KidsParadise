let MongoClient=require('mongodb').MongoClient
require('dotenv').config();

let state={
    db:null
}
module.exports.connect=function(done){
    let url= process.env.DB_URL
    let dbname=process.env.DB_NAME

    MongoClient.connect(process.env.DB_URL, (err, data)=>{
        if(err) return done(err)
        state.db = data.db(dbname)
        done()
    }) 
}
module.exports.get=function(){
    return state.db;
}
//change mongodb version "mongodb": "^5.1.0" to "mongodb": "^4.14.0" in package.json, then again run "npm i"