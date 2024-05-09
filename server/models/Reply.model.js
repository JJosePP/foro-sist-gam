import mongoose from "mongoose";
import postModel from "./Post.model.js"

const replySchema = new mongoose.Schema({
    moderatedContent: {
        type: String
    },
    thread: {
        type: mongoose.Types.ObjectId,
        ref: "Thread",
        required: true
    }
},{timestamps: true, discriminatorKey:'kind'})

const Reply = postModel.discriminator("Reply", replySchema)

export default Reply;