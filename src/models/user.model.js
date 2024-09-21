import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName:{
        type: String,
        required: true,
        trim: true,
        index: true //used to help in searching
    },
    avatar:{
        type: String, //getting from cloudinary where pur files are stored and will return a string
        required: true,
    },
    coverImage: {
        type: String
    },
    watchHistory: [
        { //instead of a mini schema we are getting the videos from the video schema and storing in an array
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password:{
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken:{
        type: String,
    }
    

}, {timestamps:true})




// used to hash passwords so that this wont lead to password leakage, so we use the hook "pre", here it performs the action before saving password it hashes it
userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next(); //so that passwprd doesnt update all the time whenerv something is changing

    this.password = await bcrypt.hash(this.password, 10) //10=no of rounds
    next()
})

//custom-methods to verifyy the password
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
}



userSchema.methods.generateAccessToken =  function (password){
    return jwt.sign({
        _id: this._id, 
        email: this.email,
        username: this.username,  //all the this.___ are coming from db
        fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: "30m" // process.env.ACCESS_TOKEN_EXPIRY is not working idk why
    })
}
userSchema.methods.generateRefreshToken =  function (password){
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: "7d" // process.env.REFRESH_TOKEN_EXPIRY
    }
)}




export const User = mongoose.model("User", userSchema ) 