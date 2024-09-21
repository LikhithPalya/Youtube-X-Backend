// require ('dotenv').config({path: './env'})
import dotenv from 'dotenv'
// import express from "express"
import { app } from './app.js';

import connectDB from './db/index.js'

dotenv.config({
    path: './env'
})
//connecting to db and showing relevat info
connectDB()
    .then(()=>{
        app.on("error", ()=>{ console.log("DB not able to connect");
            throw error;
        })
        app.listen(process.env.PORT || 8000, ()=>{
            console.log(`Server is running at port: ${process.env.PORT}`);
        })
    })
    .catch((error)=>{
        console.log("MongoDB connection error failed " + error);
    })


/*
import express from 'express'
const app = express()

;( async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", ()=>{ console.log("DB not able to connect");
            throw error
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on port ${process.eventNames.PORT}`);
        })
        
    } catch (error) {
        console.log(error);
        throw error
    }
})()
    */