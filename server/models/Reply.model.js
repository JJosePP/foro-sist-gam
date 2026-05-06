import mongoose from "mongoose";
import postModel from "./Post.model.js"

const replySchema = new mongoose.Schema({
    thread: {
        type: mongoose.Types.ObjectId,
        ref: "Thread",
        required: [true, 'El hilo es requerido']
    }
},{ discriminatorKey:'kind'})

replySchema.index({thread: 1, createdAt: -1})

const Reply = postModel.discriminator("Reply", replySchema)

export default Reply;