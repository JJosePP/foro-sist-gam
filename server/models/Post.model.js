import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'El contenido es requerido'],
        maxLength: [8000, 'La longitud máxima es 8000 caracteres']
    },
    positiveVotes:{
        type: Number,
        default: 0
    },
    negativeVotes:{
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, 'El usuario es requerido']
    },
    isModerated: {
        type: Boolean,
        default: false
    },
    moderationReason: {
        type: String,
        enum: ['Ofensivo', 'Spam', 'Fuera de tema', 'Lenguaje inapropiado']
    },
    moderatedBy: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    moderatedAt: {
        type: Date
    },
    negativeVotesList: {
        type:[{
            type: mongoose.Types.ObjectId,
            ref: "User"
        }],
        default: []
    },
    positiveVotesList: {
        type:[{
            type: mongoose.Types.ObjectId,
            ref: "User"
        }],
        default: []
    }
}, {timestamps: true, discriminatorKey:'kind'})

postSchema.index({kind: 1, createdAt: -1})
postSchema.index({kind: 1, title: 1})
postSchema.index({kind: 1, positiveVotes: 1})
const Post = mongoose.model("Post", postSchema)

export default Post;