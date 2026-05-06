import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'El nombre de la insignia es requerido'],
    },
    normalizedName:{
        type: String,
        unique: true
    },
    image:{
        public_id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    },
    users: {
       type: [{
            type: mongoose.Types.ObjectId,
            ref: 'User'
       }],
       default: [],
       index: true
    },
    quiz:{
        type: mongoose.Types.ObjectId,
        ref: 'Quiz'
    }
}, {
    timestamps: true
})

badgeSchema.index({name: 1, _id: 1});
const Badge = mongoose.model('Badge', badgeSchema)

export default Badge;