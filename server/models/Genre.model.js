import mongoose from "mongoose";

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxLength: [30, "La longitud máxima es 30 caracteres"],
    },
    games: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Game",
        },
    ],
});

const Genre = mongoose.model("Genre", genreSchema);

export default Genre;
