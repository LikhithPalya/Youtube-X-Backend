import { v2 as cloudinary } from 'cloudinary';
import fs from"fs" //to handle files

//  IDEA IS TO BRING FILE TO SERVER USING MULTER AND THEN MOVING IT OVER TO CLOUDINARY, SO MULTER ACTS LIKE A MIDDLEWARE

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    }); 
const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null;
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto' //type of file to be uploaded
        })
        //file has been successfully uploaded.
        console.log("File is uploaded on cloudinary!",  response.url);
        // once file is uploaded, remove it (unlink it)
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        // if the file is on our server but not uploaded? it can lead to data leakage and shi, so for safety we have to remove from our server.

        fs.unlinkSync(localFilePath) //removes the locally saved temp file as the upload ops has failed
        return null;
        
    } 
}

export {uploadOnCloudinary}


