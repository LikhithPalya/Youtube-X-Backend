import { asyncHandler } from "../uitls/asyncHandler.js"
import { ApiError } from "../uitls/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../uitls/cloudinary.js"
import { ApiResponse } from "../uitls/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const generateAccesAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        // we'll store refreshtoken in DB
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }) //dont validate anything everytime we save(applies for password)

        return { accessToken, refreshToken }



    } catch (error) {
        throw new ApiError(500, `${error.message} Something went wrong while generating refresh and access token`)
    }
}

// async handle registers a user
const registerUser = asyncHandler(async (req, res) => {
    // step-1 = get user details from frontend, since we dont have a FE, we use POstman for our userdeets
    // step-2 = validation of data
    // step-3 = check if user already exists(how to do? check wrt email&username)
    // step-4 = check if images and avatar are  available? upload to cloudinary(and get the cloudinary url returned) 
    // step - 5 = check if the avatar is uploaded on cloudinary
    // step 6 = create a user object as noSQL db store in objects. ( .create() )
    // step 7 = remove password and refresh token field from response (to frontend)
    // step 8 = check for user creation, if created return response else error

    console.log(req.body); // req = request the user is sending which contains all the information you need!
                    // req.body =  [Object: null prototype] {
                    //     fullName: 'one',
                    //     email: 'one7@gmail.com',
                    //     password: '12345678',
                    //     username: 'one7',
                    //     coverImage: ''
                    // }

    // #1 = get user details from form or body diff for url
    const { fullName, email, username, password } = req.body

    console.log("req.body = ", req.body);
    // if(fullName === "") {
    //     throw new ApiError(400, "full name is required")
    // } //EITHER DO THIS FOR ALL OR USE .SOME METHOD

    // #2 checks if all the fields are not empty
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "") //trim removes whitespaces
    ) {
        throw new ApiError(400, "all fields are required!")
    }

    // #3
    const existedUser = await User.findOne({
        $or: [{ username }, { email }] //return the first referenced name/email (to check the presence of the user in the db)
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or userName already exists!");
    }

    // #4
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    console.log("req.files",req.files);
            // req.files [Object: null prototype] {
            //     avatar: [
            //       {
            //         fieldname: 'avatar',
            //         originalname: 'wallpaperflare.com_wallpaper (6).jpg',
            //         encoding: '7bit',
            //         mimetype: 'image/jpeg',
            //         destination: './public/temp',
            //         filename: 'wallpaperflare.com_wallpaper (6).jpg',
            //         path: 'public/temp/wallpaperflare.com_wallpaper (6).jpg',
            //         size: 657173
            //       }
            //     ]
            //   }
    console.log("coverImageLocalPath=", coverImageLocalPath); //coverImageLocalPath= undefined
    // HAVE TO FIX


    // #5
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    //upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    console.log(coverImage);

    if (!avatar) {
        throw new ApiError(400, "Avatar is required to be uploaded")
    }

    // #6 USER IS THE ONLY THING COMMUNICATING WITH DB
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // is no coverimage, fuck it! else your code will break
        email,
        password,
        username: username.toLowerCase()
    })
    // #7
    const createdUser = await User.findById(user._id).select("-password -refreshToken") // DB GIVES THE _id which helps to lookup && "-..." helps to remove the password and refreshToken

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }

    // #8 
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User succeffully registered")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    //  TODOsssss->
    // 1= get data from req body
    // 2= check email or name (for auth)
    // 3=find the user based on email/name
    // 4= if user found, check password, if wrong fuck it
    // 5= if password is correct, generate access and refreshh token and send to user via secure cookies
    // 6= response, successfully logged ind!

    const { email, username, password } = req.body
    console.log(req.body);

    if (!username && !email) { // OR WE CAN USE !(USERNAME || EMAIL)
        throw new ApiError(400, "username/email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }] //will find user based on either username or email
    }) // user  =  instance of User, here we are trying to find an exisiting user to login

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    // #if user is found, check password, using bcrypt from the user.model file
    const isPasswordValid = await user.isPasswordCorrect(password) //we're getting password from req.body

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password!")
    }

    // generate Access and Refresh Token, as it is common, we make a separate method
    const { accessToken, refreshToken } = await generateAccesAndRefreshTokens(user._id) //_id sent by DB

    //sending info via cookies
    const loggedInUser = await User.findById(user._id).select("-password, -refreshToken") //exclude password and refreshtoken

    const options = {
        httpOnly: true,
        secure: false //when sent like this, cookies can only be modified by server and noone else (but if set to true, cookies isnt generated)
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully"
            )
        )

    console.log(user);
})

const logoutUser = asyncHandler(async (req, res) => {
    // when logged out, refreshToken has to be deleted. we use the concept of a middleware, so we make our own middleware
    await User.findByIdAndUpdate(
        req.user._id, {
        $set: { //updating
            refreshToken: undefined
        }
    }, {
        new: true,

    }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    //TODOSss
    // #1 we have to refresh AccessToken, so we need to access it via cookies

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken //for mobile users

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorised request")
    }

    // to verify the incoming token, we verify using jwt
    try {

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        ); //have to send a token and a secret key

        const user = await User.findById(decodedToken?.id);

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }

        // to match incominfRefreshToken and the token found via User
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refreshToken is expired or used");
        }

        // if they both match! Generate new accessAndRefreshToken
        const { accessToken, newRefreshToken } =
            await generateAccesAndRefreshTokens(user._id);

        const options = {
            htttpOnly: true,
            secure: false,
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "AccessToken refreshed successfully!"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }


})


const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    // if(!(newPassword === oldPassword)){
    //     throw new ApiError(401, "Old and new password dont match") IF YOU WANT TO DOUBLE CHECK PASSWORD {CONFIRM PASSWORD}
    // }

    // we need a user to change password and to do ths he needs to be logged in and we can take the user id from the auth middleware (req.id)
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid password")
    }
    // if password is correct, you are eligible to set new pasword

    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res
        .status(200)
        .json(
            new ApiResponse(200, { /* no data */ }, "Password changed successfully!"),
        )

})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully!"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body()
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email, // OR WE CAN USE ES6 SYNTAX AND WRITE ONLY ONE WORD

            }
        },
        { new: true }
    ).select("-password") //dont consider password

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))

})

const updateUserAvatar = asyncHandler(async (req, res) => {
    /*not files as its a singular now*/
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //now upload to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath) 

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar on cloudinary")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res
        .status(200)
        json(new ApiResponse(200, {user}, "Avatar Updated suf=ccessfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    /*not files as its a singular now*/
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing")
    }

    //now upload to cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath) 

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading coverImage on cloudinary")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select("-password")

    return res
        .status(200)
        json(new ApiResponse(200, {user}, "CoverImage Updated suf=ccessfully"))
})


const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params
    if(!username?.trim()){
        throw new ApiError(400,"Username is missing")
    }

    const channel = await User.aggregate([
        { // filtering the user based on username
            $match:{
                username: username?.toLowerCase()
            }
        },
        {   //finding the subscribers of that channel!
            $lookup:{
                from:"subscriptions", //Subscription is in lowercase and plural as its in DB 
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions", //Subscription is in lowercase and plural as its in DB 
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo" // points to subscribed to whom 
            }
        },
        {
            $addFields:{
                subscribersCount:{ //to calculae subscribers count
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo" // $ as its a field
                },
                isSubscribed:{ // to check if the user is subscribed
                    $condition:{
                        if:{$in: [req.user?._id, "$subscribers.subscriber"]},
                        then:true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1,
                // IF USER WANTS TO SINCE WEHNIS THE ACC IN USE, THEN SEND THE CREATED IN AS WELL!
            }
        }

    ])

    if(!channel?.length){
        throw new ApiError(404, "channel doesnt exist!")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "User Channel Fetched successfully!")
        )

})

const getWatchHistory = asyncHandler(async(res,req)=>{
    //  from req.user._id, we get the string which is later passed on to mongoose which converts this to id

    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",

                // WE ARE NOW INSIDE THE VIDEOS MODEL, TO ACCESS THE OWNER, WE NEST THE PIPELINES more info at "../../public/notes/watchHistory.png"

                pipeline: [
                    {
                        $lookup:{
                            from: "users",
                            localField:"videos",
                            foreignField:"owner",
                            foreignField: "_id",
                            as: "owner",

                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        // helping the frontEnd engg to get the object of the user, if not this then FE will only get an array!
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ]) 

    return res
        .status(200)
        .json(
            200,
            user[0].WatchHistory,
            "Watch history fetched successfully!"
        )
})


export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails,updateUserAvatar,updateUserCoverImage, getUserChannelProfile,getWatchHistory }