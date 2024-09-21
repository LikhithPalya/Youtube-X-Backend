import { ApiError } from '../uitls/ApiError.js'
import {asyncHandler} from '../uitls/asyncHandler.js'
import jwt from "jsonwebtoken"
import { User } from '../models/user.model.js'



export const verifyJWT = asyncHandler(async(req,res,next)=>{
   try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "") // if there are np cookies the user mught send authorization headers(mostly seen in mobile apps )

    if(!token){
    throw new ApiError(401, "Unauthorised request")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

    if(!user){
        throw new ApiError(401, "Invalid accessToken")
    }

    req.user = user;
    next()
    // its work is done so it is passed on to next step
    
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }


})