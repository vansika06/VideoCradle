import {v2 as cloudinary} from 'cloudinary';//v2 import kiye but name accha nhi therefore as cloudinary import
import fs from "fs";
          
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });
  const uploadOnCloudinary=async(localFilePath)=>{
    try{
        if(!localFilePath) return null;//agar local file path hai hi nhi return null
        //uplaoding on cloudinary agar path h
     const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file has been uploaded successfully
        console.log("uploaded",response.url)//response will have various features we printing url
        return response
    }
    catch{
        //remove the locally saved temporary file as the upload operation got failed to remove corrupted/malicious files
        fs.unlinkSync(localFilePath)
    }
  }
  export {uploadOnCloudinary}