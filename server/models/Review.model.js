import mongoose from "mongoose";
import postModel from "./Post.model.js";

const rt = {
    type: Number,
    required: [true, 'La puntuación es requerida'],
    min: [1, "La puntuación mínima es 1"],
    max: [100, "La puntuación máxima es 100"],
    validate: {
        validator: Number.isInteger, 
        message: 'El valor debe ser un número entero'
    }
};
const reviewSchema = new mongoose.Schema(
    {
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
            required: [true, 'El juego es requerido']
        }
    },
    { discriminatorKey: "kind" }
);
reviewSchema.index({game: 1, createdAt: -1});
const Review = postModel.discriminator("Review", reviewSchema);

export default Review;
