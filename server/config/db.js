import mongoose from "mongoose";
import "dotenv/config"

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI /* ,{ autoIndex: false } */);
        console.log("MongoDB database Connected...")
    } catch(error){
        console.log(error)
    }
}

export default connectDB;