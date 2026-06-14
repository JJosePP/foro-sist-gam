import genreModel from "../models/Genre.model.js";
import genreService from '../services/Genre.service.js';

const getGenres = async (req, res, next) => {
    try {
            let result = await genreService.getGenres();
    
            return res.status(200).json({result})
        } catch (error) {
            next(error)
        }
}

const createGenre = async (req,res,next) => {
    try {  
        const genre = await genreService.createGenre(req.body);
        
        return res.status(200).json({
            msg: "Género creado éxito", 
            createdGenre: genre})
    } catch (error) {
        next(error)
    }
}

const deleteGenre = async (req,res,next) => {
    try {
        const genreId = req.params.genreId;

        await genreService.deleteGenre(genreId)
        return res.status(200).json({message: "Género eliminado con éxito"})
    } catch (error) {
        next(error)
    }
}


export default {
    getGenres,
    createGenre,
    deleteGenre
}