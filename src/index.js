//require('dotenv').config({path:'./env'}) -- this will work but syntax mismatch
import dotenv from "dotenv"
import mongoose, { connect } from "mongoose"
import {DB_NAME} from "./constants.js"
import connectDB from "./db/index.js"
import { app } from "./app.js"
dotenv.config({
    path:'./env'
})
connectDB()
.then(()=>{
  app.on("error",(e)=>{
    console.log(e);
    throw e
  })
  app.listen(process.env.PORT||8000,()=>{
    console.log(`Server running at :${process.env.PORT||8000}`)
  })
})
.catch((e)=>{
  console.log("MongoDb connection failed::",e)
})



/*import express from "express"
const app=express()
/*function connectDB(){

}
connectDB()
;(async()=>{
    try{
      await  mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
      app.on("error",(error)=>{
        console.log("ERR:",error);
        throw error
      })
      app.listen(process.env.PORT,()=>{
        console.log(`app is listening at:${process.env.PORT}`)
      })
    }
    catch(e){
        console.error("Error:",e);
        throw e
    }
})()*/