import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    reason:{
        type: String,
        required: [true, 'El nombre de la insignia es requerido'],
        maxLength: [1000, 'La longitud máxima es 1000 caracteres']
    },
    post: {
        type: mongoose.Types.ObjectId,
        ref: "Post",
        required: [true, 'La publicación es requerida']
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, 'El usuario es requerido']
    },
    urlToPost: {
        type: String,
        require: [true, 'Debe proporcionar el enlace hacia la publicación']
    }
}, {
    timestamps: true
})

const Report = mongoose.model('Report', reportSchema)

export default Report;