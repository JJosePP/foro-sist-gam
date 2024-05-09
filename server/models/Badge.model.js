import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    image:{
        public_id: {
            type: String
        },
        secure_url: {
            type: String,
            required: true
        }
    },
    users: [{
        type: mongoose.Types.ObjectId, 
        ref: 'User'
    }],
    quiz:{
        type: mongoose.Types.ObjectId,
        ref: 'Quiz'
    }
})

const Badge = mongoose.model("Badge", badgeSchema)

export default Badge;