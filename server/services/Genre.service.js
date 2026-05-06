import genreModel from "../models/Genre.model.js";
import gameModel from "../models/Game.model.js";
import { apiErrors } from "../utils/apiErrors.js";
import { normalizeName } from "../utils/namedEntitySchema.js";

const getGenres = async () => {
    const result = await genreModel.find().sort({name: 1, _id:1}).select('_id name');

    return result;

}

const createGenre = async (genreData) => {
    let normalizedName = normalizeName(genreData.name)
    
    let existingGenre = await genreModel.exists({normalizedName: normalizedName})

    if(existingGenre){
        throw apiErrors.existingGenre
    }

    const genre = await genreModel.create({
        normalizedName:normalizedName,
        name: genreData.name.replace(/\s* \s*/g,' ')
    });

    return genre;
}

const deleteGenre = async (genreId) => {
    let genre = await genreModel.findByIdAndDelete(genreId)
    if(!genre){
        throw apiErrors.genreNotFound
    }

    //Quitamos el ID del género eliminado de todos los juegos que contenían ese género
    await gameModel.updateMany(
        {genres: genre.id},
        {$pull: {genres: genre.id}})
}



export default {
    getGenres,
    createGenre,
    deleteGenre
}