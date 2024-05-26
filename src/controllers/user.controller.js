import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
const registerUser=asyncHandler(async(req,res)=>{
   const {username,email,fullname,password}=req.body
   //console.log("Email:",email);
  // console.log(req.body);---
  /*[Object: null prototype] {
  email: 'aasa@lls.com',
  username: 'abcd',
  password: '246810',
  fullname: 'abbbc'
} aisa dikhta h req.body */
    //agar koi bhi field trim krne k baad empty h toh y true return kr dega
   if([username,email,fullname,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required")
   }
  const existedUser= await User.findOne({
      $or:[{username},{password}]
   })
   if(existedUser){
      throw new ApiError(409,"User with email or username exists")
   }
   //console.log(req.files);
   //if we do req.files it is a array of objects and we are acceessing the first object and under that path
   //it looks like--
   /*avatar: [
    {
      fieldname: 'avatar',
      originalname: '54a7adf55416d65d6ef72657cf56a58b--rental-websites-renting.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      destination: './public/temp',
      filename: '54a7adf55416d65d6ef72657cf56a58b--rental-websites-renting.jpg',
      path: 'public\\temp\\54a7adf55416d65d6ef72657cf56a58b--rental-websites-renting.jpg',
      size: 31170
    }
  ] */  
const avatarLocalPath=req.files?.avatar[0]?.path;
//const coverLocalPath=req.files?.coverImage[0]?.path;
      let coverLocalPath;
      if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0){
         coverLocalPath=req.files.coverImage[0].path
      }
   if(!avatarLocalPath){
      throw new ApiError(400,"Avatar is required")
   }
  const avatar= await uploadOnCloudinary(avatarLocalPath)//jo response return  aaya
  const coverImage=await uploadOnCloudinary(coverLocalPath)
  if(!avatar){
   throw new ApiError(400,"Avatar is required")
  }
 const user=await User.create({fullname,
               avatar:avatar.url,
               coverImage:coverImage?coverImage.url:"",
               email,
               password,
               username:username.toLowerCase()
            })
 const createUser=await User.findById(user._id).select("-password -refreshToken")
 console.log(createUser)
   if(!createUser){
      throw new ApiError(500,"something went wrong while registering the user")
   }
   return res.status(201)
      .json(
         new ApiResponse(201,createUser,"User registered successfully")
      )
   

})

export {registerUser}