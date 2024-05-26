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
        //console.log("uploaded",response.url)//response will have various features we printing url
        //console.log(response)--
        /*{
  asset_id: 'a6e7c6a9c4f34ae9f2db6f26833e0b44',
  public_id: 'tyvdfb8zpdf51hsbu8ix',
  version: 1716708205,
  version_id: '2f217d5ad7764f5f025b905f062262ba',
  signature: '3b200c8bb91f7435be6df6b2d5f14631690d71a6',
  width: 1920,
  height: 1080,
  format: 'png',
  resource_type: 'image',
  created_at: '2024-05-26T07:23:25Z',
  tags: [],
  bytes: 657002,
  type: 'upload',
  etag: '6e3fcbec3df7391363bc16f7d747ef7c',
  placeholder: false,
  url: 'http://res.cloudinary.com/drt5kcaqj/image/upload/v1716708205/tyvdfb8zpdf51hsbu8ix.png',    
  secure_url: 'https://res.cloudinary.com/drt5kcaqj/image/upload/v1716708205/tyvdfb8zpdf51hsbu8ix.png',
  folder: '',
  original_filename: 'Screenshot (7)',
  api_key: '994581943522123'
} */
        fs.unlinkSync(localFilePath)
        return response
    }
    catch{
        //remove the locally saved temporary file as the upload operation got failed to remove corrupted/malicious files
        fs.unlinkSync(localFilePath)
    }
  }
  export {uploadOnCloudinary}