import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        maxLength: [4000, 'La longitud máxima es 4000 caracteres']
    },
    positiveVotes:{
        type: Number
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true, discriminatorKey:'kind'})

const Post = mongoose.model("Post", postSchema)

export default Post;