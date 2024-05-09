import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    platform: [
        {
            type: String,
            required: true,
        },
    ],
    developmentCompany: {
        type: String,
        required: true,
    },
    releaseDate: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
        maxLength: [500, "La longitud máxima permitida es 500 caracteres"],
    },
    screenshots: [
        {
            type: String,
        },
    ],
    genres: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Genre",
            required: true,
        },
    ],
});

const Game = mongoose.model("Game", gameSchema);

export default Game;
