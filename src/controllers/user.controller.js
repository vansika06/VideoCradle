import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"
const generateAccessAndRefreshToken=async(userId)=>{///jb pswd wgerah validate ho ja rha h tb yeh kr rhe isliye user obj jo banaye h usse asani se id nikal kr pass kr skte
      try{
         const user=await User.findById(userId)
        const accessToken= user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken
       await user.save({
         validateBeforeSave:false
        })
        return{accessToken,refreshToken}
      }
      catch{
       throw new ApiError(500,"Something went wrong while generating refresh and access token")  
      }
}
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

const loginUser=asyncHandler(async(req,res)=>{
      const {email,username,password}=req.body
      //jo diya uske basis pr login
      console.log(email);
      if(!username && !email){
         throw new ApiError(400,"username or email is required")
      }

      //checking if the given username or email exists in th db

    const user=  await User.findOne({
         $or:[{username},{email}]
      })

      if(!user){
         throw new ApiError(404,"user does not exist")
      }
      //User mongodb k banaya hua obj h ispr mongodb k func hi laga skte user hmara banaya obj h ispr hmare defined obj h
      const isPasswordValid=await user.isPasswordCorrect(password)//jo body se nikale
      if(!isPasswordValid){
         throw new ApiError(401,"Invalid User credentials");
      } 
      const{accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
      //updating user as function k andar change ho gya h
      const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
      const options={
         httpOnly:true,
         secure:true
      }
      res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",refreshToken,options)
      .json(
         new ApiResponse(200,{
            user:loggedInUser,accessToken,refreshToken
         },
      "user logged in successfully")
      )

})


const logOutUser=asyncHandler(async(req,res)=>{
         User.findByIdAndUpdate(req.user._id,{
            $set:{
               refreshToken:undefined
            }
         },
      {
         new:true
      })

      const options={
         httpOnly:true,
         secure:true
      }
      return res
      .status(200)
      .clearCookie("accessToken",options)
      .clearCookie("refreshToken",options)
      .json(new ApiResponse(200,{},"user loogged out successfully"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
   const refreshTokenReceived=req.cookies.refreshToken||req.body.refreshToken
   if(!refreshTokenReceived){
      throw new ApiError(401,"unauthorized request")
   }
     try {
       const decodedToken=  jwt.verify(refreshTokenReceived,process.env.REFRESH_TOKEN_SECRET)
      const user= await User.findById(decodedToken?._id)
      if(!user){
       throw new ApiError(401,"Invalid Refresh Token")
    }
    if(refreshTokenReceived!==user?.refreshToken){
       throw new ApiError(401,"Refresh Token expired or used")
    }
    const options={
       httpOnly:true,
       secure:true
    }
   const {accessToken,newrefreshToken}= await generateAccessAndRefreshToken(user._id);
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
       new ApiResponse(
          200,
          {
             accessToken,newrefreshToken
          },
          "Access Token Refreshed"
       )
    )
     } catch (error) {
      throw new ApiError(401,error?.message||"invalid refresh token")
     }
}

)
export {registerUser,loginUser,logOutUser,refreshAccessToken}