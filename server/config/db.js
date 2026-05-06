import mongoose from "mongoose";
import "dotenv/config"

async function connectDB(){
    try{
        mongoose.set('debug',true)
        await mongoose.connect(process.env.MONGO_URI, /* ,{ autoIndex: false } */{
            serverSelectionTimeoutMS: 10000, // espera hasta 10s para conectar
            socketTimeoutMS: 45000, // tiempo de espera antes de cerrar socket
        });
        console.log("MongoDB database Connected...")
    } catch(error){
        console.error('Error conectando a MongoDB:', error)
        throw new Error('Error conectando a MongoDB:', error)
    }
}

export default connectDB;