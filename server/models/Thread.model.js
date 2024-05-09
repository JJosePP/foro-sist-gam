import mongoose from "mongoose";
import postModel from "./Post.model.js";

const threadSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            minLength: [5, "La longitud mímina del título es 5 caracteres"],
            maxLength: [50, "La longitud máxima del título es 50 caracteres"],
        },
        category: {
            type: mongoose.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: {
                values: ["Abierto", "Cerrado"],
                message: '{VALUE} no es correcto'
            },
        },
    },
    { timestamps: true, discriminatorKey: "kind" }
);

const Thread = postModel.discriminator("Thread", threadSchema);

export default Thread;
