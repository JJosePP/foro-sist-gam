import mongoose from "mongoose";
import postModel from "./Post.model.js";

function possitiveNumber (val) {
    return val >= 0;
}

const numberValidators = [
    {validator: possitiveNumber, message: 'Debe ser un número positivo'},
    {validator: Number.isInteger, message: 'Debe ser un número entero'}
]

const threadSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "El título es requerido"],
            minLength: [5, "La longitud mímina del título es 5 caracteres"],
            maxLength: [50, "La longitud máxima del título es 50 caracteres"],
        },
        category: {
            type: mongoose.Types.ObjectId,
            ref: "Category",
            required: [true, "La categoría es requerida"],
        },
        status: {
            type: String,
            required: [true, "El estado es requerido"],
            enum: {
                values: ["Abierto", "Cerrado"],
                message: "{VALUE} no es correcto",
            },
            default: "Abierto",
        },
        numReplies: {
            type: Number,
            validate: numberValidators,
            default: 0
        },
    },
    { discriminatorKey: "kind" }
);
threadSchema.index({category: 1, createdAt: 1, _id:1});
threadSchema.index({category: 1, createdAt: -1, _id:1});
threadSchema.index({category: 1, possitiveVotes: 1, _id:1});
threadSchema.index({category: 1, possitiveVotes: -1, _id:1});
threadSchema.index({category: 1, title: 1, _id:1});
threadSchema.index({category: 1, title: -1, _id:1});
const Thread = postModel.discriminator("Thread", threadSchema);

export default Thread;
