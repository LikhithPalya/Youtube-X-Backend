import mongoose , { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, //one who is subscribing
        ref: "user"
    },
    channel:{
        type: Schema.Types.ObjectId, //to whom you are subscribing
        ref: "user"
    }
}, {timestamps:true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema )

