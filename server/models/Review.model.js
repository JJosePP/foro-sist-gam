import mongoose from "mongoose";
import postModel from "./Post.model.js";

const rt = {
    type: Number,
    required: true,
    min: [1, "La puntuación mínima es 1"],
    max: [100, "La puntuación máxima es 100"],
};
const reviewSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            maxLength: [20, "La longitud máxima del título es 20 caracteres"],
        },
        rating: {
            overall: rt,
            story: rt,
            gameplay: rt,
            technicalSection: rt,
            art: rt,
            sound: rt,
        },
        game: {
            type: mongoose.Types.ObjectId,
            ref: "Game",
            required: true
        }
    },
    { timestamps: true, discriminatorKey: "kind" }
);

const Review = postModel.discriminator("Review", reviewSchema);

export default Review;
