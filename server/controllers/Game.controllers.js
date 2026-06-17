import gameService from "../services/Game.service.js";
import fs from 'fs-extra';

const unlinkFiles = async (mainImage, screenshots) => {
    let images = [];
    if(mainImage){
        images.push(...mainImage)
    }
    if(screenshots){
        images.push(...screenshots)
    }

    await Promise.all(
        images.map(image => fs.unlink(image.path))
    )
}

const createGame = async (req,res,next) => {
    try {
        req.files = Object.assign({},req.files)
        const game = await gameService.createGame(req.body, req.files);
        let g = await game.populate([
            {path: "genres", select: "id name"},
            {path: "platforms", select: "id name"}
        ]);
        await unlinkFiles(req.files.mainImage,req.files.screenshots)
        
        return res.status(201).json({
            msg: "Juego introducido correctamente",
            createdGame: g})

    } catch (error) {
        next(error)
    } 
}

const editGame = async (req,res,next) => {
    try {
        const gameId = req.params.gameId;

        req.files = Object.assign({},req.files)
        const game = await gameService.editGame(gameId,req.body,req.files)
        await unlinkFiles(req.files.mainImage,req.files.screenshots)
 
        let g = await game.populate([
            {path: "genres", select: "id name"},
            {path: "platforms", select: "id name"}
        ])
        return res.status(200).json({
            msg: "Juego modificado correctamente",
            editedGame: g})

    } catch (error) {
        next(error)
    }
}

const deleteScreenshot = async(req,res,next) => {
    try {
        const {gameId, imageId} = req.params;
        console.log(imageId)

        await gameService.deleteScreenshot(gameId,imageId)

        return res.status(200).json("Captura eliminada con éxito")
    } catch (error) {
        next(error)
    }
}

const deleteGame = async (req, res, next) => {
    try {
        const gameId = req.params.gameId;

        await gameService.deleteGame(gameId)
        return res.status(200).json({message: "Juego eliminado correctamente"})
    } catch (error) {
        next(error)
    }
}

const getGames = async(req,res,next) => {
    try {
        let resultsPerPage = Math.floor(req.query.resultsPerPage) || 20
        let page = Math.floor(req.query.page) || 1
        let genres = req.query.genres
        let platforms = req.query.platforms
        let sortBy = req.query.sortBy
        let order = req.query.order
        let search = req.query.search

        if(genres){
            if(genres instanceof Array){
                genres = genres.map(g=>g.trim())
            }else{
                genres = genres.trim()
            }
        }
        if(platforms){
            if(platforms instanceof Array){
                platforms = platforms.map(p=>p.trim())
            }else{
                platforms = platforms.trim()
            }      
        }
        if(sortBy){
            if(sortBy instanceof Array){
                sortBy = sortBy[0]
            }
            sortBy = sortBy.trim()
        }

        if(order){
            if(order instanceof Array){
                order = order[0]
            }
            order = order.trim()
        }
        console.log
        const allowedSortFields = ['createdAt', 'rating.overall', 'releaseDate', 'name'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
        console.log("SORTFIELD: ", sortField)
        const sortOrder = order === 'desc' ? -1 : 1;
        console.log("ORDEN: ", sortOrder)
        const sort = {[sortField]: sortOrder, _id:1};
        if(resultsPerPage < 1) {resultsPerPage = 20}
        if(resultsPerPage > 50) {resultsPerPage = 50}

        if(page < 1) {page = 1}

        let result = await gameService.getGames(resultsPerPage, page, genres,platforms, sort, search);
        
        const games = result.data.map(game => {
            for (let score in game.rating){
                // game.rating[score] = game.rating[score] / game.numReviews
                game.rating[score] = Math.round(((game.rating[score] / game.numReviews) + Number.EPSILON) * 100) / 100
            }
            return game;
        });
        return res.status(200).json({games,
            currentPage:result.currentPage,
            hasNextPage: result.hasNextPage,
            totalPages:result.totalPages,
            totalGames:result.totalItems
        });
    } catch (error) {
        next(error)
    }
}

//EN EL FRONTEND CUANDO SE ELIJA LA FECHA VA A HABER QUE CAMBIAR LA POSICION DEL DIA Y MES
const getGame = async(req,res,next) => {
    try {
        const gameId = req.params.gameId
        let result = await gameService.getGame(gameId)

        return res.status(200).json({result})
    } catch (error) {
        next(error)
    }
}

//cuando use search en front, no llamar funcion hasta que usuario haya escrito 2 caracteres
const searchGames = async (req,res,next) => {
    try {
        let search = req.query.search
        let result = await gameService.searchGames(search)
        return res.status(200).json({result})
    } catch (error) {
        next(error)
    }
}

const getGamesAdmin = async (req,res,next) => {
    try {
        let result = await gameService.getGamesAdmin();
        return res.status(200).json(result);
    } catch (error) {
        next(error)
    }
}

export default {
    createGame,
    editGame,
    getGame,
    deleteScreenshot,
    deleteGame,
    getGames,
    searchGames,
    getGamesAdmin
}