import mongoose from "mongoose";
import { basedSchema } from "../utils/namedEntitySchema.js";




const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required:[true, 'El nombre del género para mostrar es requerido'],
        minLength: [2, 'La longitud máxima es 2 caracteres'],
        maxLength: [30, 'La longitud máxima es 30 caracteres'],
    },
    normalizedName: {
        type: String,
        unique: true
    },
    image:{
        public_id: {
            type: String,
            required: [true, 'La imagen (public_id) es requerida']
        },
        secure_url: {
            type: String,
            required: [true, 'La imagen (secure_url) es requerida']
        }
    },
    description: {
        type: String,
        required: [true, 'La descripción de la categoría es requerida'],
        maxLength: [200, 'La longitud máxima permitida es 200 caracteres']
    }
}, {
    timestamps: true
});

const Category = mongoose.model("Category", categorySchema)


export default Category;