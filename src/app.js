import express from "express"
import cors from "cors"
// to access user cookies from user's browser
import cookieParser from "cookie-parser"

const app = express();

// to configure cors
app.use(cors({
    origin: process.env.PORT, // or if you want to accept requests from any url, just put "*"
    credentials: true //includes creds like cookies, authorization, headers etc
}))

//to limit the amount of json data you're getting via forms, body etc
app.use(express.json({limit: "16kb"}))

// getting data from url!, you can keep the limit constant by keeping that as a constant
app.use(express.urlencoded({extended:true, limit:"16kb"}))

// to store images nd media using a "public" FOLDER, 
app.use(express.static("public")) 

app.use(cookieParser())


//routes import
import userRouter from "./routes/user.routes.js" 

app.use('/api/v1/users', userRouter) //when the user goes to this path, the control goes to user.routes file and does the logic. so this is by default 
// http://localhost:3000/api/v1/users when its sent to userRouter it modifies it into the required form i.e ../login , .../register etc


export {app}
