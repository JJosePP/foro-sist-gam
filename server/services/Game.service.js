import genreModel from "../models/Genre.model.js"
import gameModel from "../models/Game.model.js"
import platformModel from '../models/Platform.model.js'
import { deleteImage, uploadImage, deleteImages, deleteFolder } from "../utils/cloudinary.js";
import { apiErrors } from "../utils/apiErrors.js";

const regex_to_remove_white_spaces = /\s* \s*/g;
const regex_to_remove_special_chars = /[^a-zA-Z0-9\s\+]/g;

const createGame = async (body, files) => {
    let game
    let uploadedImages =  []
    try {

        let normalizedName = body.name
                .replaceAll(regex_to_remove_special_chars,' ')
                .replaceAll(regex_to_remove_white_spaces,'-').toLowerCase();
        const existingGame = await gameModel.exists({normalizedName:normalizedName })
        let e = await gameModel.exists({normalizedName:normalizedName }).explain("executionStats")
        if(existingGame) {
            throw apiErrors.existingGame;
        }

        game = new gameModel({
            name: body.name.replace(regex_to_remove_white_spaces,' '),
            platforms: body.platforms,
            developmentCompany: body.developmentCompany.replace(regex_to_remove_white_spaces,' '),
            releaseDate: body.releaseDate,
            description: body.description,
            genres: body.genres,
            normalizedName: normalizedName
        })

        let result = await uploadImage(files.mainImage[0].path, 'games', game.id, "mainImage")
        game.mainImage = {
            public_id: result.public_id,
            secure_url: result.secure_url
        };
        uploadedImages.push(result.public_id);

        await game.validate();

        if(files.screenshots){
            for(let f of files.screenshots){
                let result = await uploadImage(f.path, 'games', game.id, "screenshot")
                game.screenshots.push({
                    public_id: result.public_id,
                    secure_url: result.secure_url
                })
                uploadedImages.push(result.public_id)
            }
        }

        const savedGame = await game.save()
        return savedGame

    } catch (error){
        if(uploadedImages.length > 0){
            let path = 'questgamer/games/' + game.id
            await deleteImages(path)
            await deleteFolder(path)
        }
        throw error
    }
};

const editGame = async (gameId, body, files) => {
    let uploadedImages = [];
    try {
        let game = await gameModel.findById(gameId)
        if(!game){
            throw apiErrors.gameNotFound
        }

        let normalizedName = body.name
            .replaceAll(regex_to_remove_special_chars,' ')
            .replaceAll(regex_to_remove_white_spaces,'-').toLowerCase();

        console.log("NOMBRE: ", normalizedName)
        const existingGame = await gameModel.exists({normalizedName:normalizedName })

        if(existingGame){
            if(!existingGame._id.equals(game._id)){
                throw apiErrors.existingGame
            }
        }
        game.name = body.name.replace(regex_to_remove_white_spaces,' ');
        game.platforms = body.platforms;
        game.developmentCompany = body.developmentCompany.replace(regex_to_remove_white_spaces,' ');;
        game.releaseDate = body.releaseDate;
        game.description = body.description;
        game.genres= body.genres;
        game.normalizedName = normalizedName

        await game.validate()

        if(files.mainImage){
            let result = await uploadImage(files.mainImage[0].path, 'games', game.id, "mainImage")
            uploadedImages.push(result.public_id)
            await deleteImage(game.mainImage.public_id)
            game.mainImage = {
                public_id: result.public_id,
                secure_url: result.secure_url
            }
        }

        if(files.screenshots){
            let numSavedScreenshots = game.screenshots.length
            let numScreenshots = files.screenshots.length
            let totalScreenshots = numSavedScreenshots + numScreenshots

            if(totalScreenshots > 10){
                let err = apiErrors.tooManyScreenshots
                let str = "Elimine alguna o escoja menos capturas para subir"
                err.details = err.details.concat(". ", str)
                throw err
            }else{
                for(let f of files.screenshots){
                    let result = await uploadImage(f.path, 'games', game.id, 'screenshot')
                    game.screenshots.push({
                        public_id: result.public_id,
                        secure_url: result.secure_url
                    })
                    uploadedImages.push(result.public_id)
                }
            }
        }
        let result = await game.save()
        return result
    } catch (error) {
        if(uploadedImages.length > 0){
            console.log(uploadedImages)
            await Promise.all(
                uploadedImages.map(i => deleteImage(i))
            )
        }
        throw error
    }
}

const deleteScreenshot = async (gameId, imageId) => {
    let game = await gameModel.findById(gameId);

    if(!game){
        throw apiErrors.gameNotFound
    };

    let publicId = 'questgamer/games/' + game.id + '/' + imageId;
    const allowedPublicIds = game.screenshots.map(i => i.public_id);

    if(allowedPublicIds.includes(publicId)){
        game.screenshots = game.screenshots.filter((screenshot) => screenshot.public_id !== publicId)
        await game.save()
        await deleteImage(publicId)
    }else {
        throw apiErrors.wrongImageId
    };
}
const deleteGame = async (gameId) => {
    let game = await gameModel.findByIdAndDelete(gameId);
    if(!game){
        throw apiErrors.gameNotFound
    }

    let path = 'questgamer/games/' + game.id
    await deleteImages(path)
    await deleteFolder(path)

    return game
}

const createPipeline = (search) => {
    const pipeline = [
        {
            $search: {
                index: "default",
                autocomplete: {
                    query: search,
                    path: "name",
                    tokenOrder: 'sequential'
                }
            }
        }
    ]
    return pipeline
}

const getGames = async (resultsPerPage, page, genres, platforms, sort, search) => {
    let result;
    let totalItems;
    let hasNextPage = false;

    const filter = {}

    if(genres) {
        console.log("GENEROS: ", genres)
        // const genreDocs = await genreModel.find(
        //     {normalizedName: {$in: genres}},
        //     {_id:1}
        // );
        // const genreIds = genreDocs.map(g=>g._id);
        // filter.genres = {$all: genreIds};
        filter.genres = {$all: genres};

    }

    if (platforms){
        // const platformDocs = await platformModel.find(
        //     {normalizedName: {$in: platforms}},
        //     {_id:1}
        // );
        // const platformIds = platformDocs.map(p => p._id);
        // filter.platforms = {$in: platformIds};
        filter.platforms = {$in: platforms};
    }
    if(search){
        const pipeline = createPipeline(search)
        if(Object.keys(filter).length !== 0){
            pipeline.push(
                {
                    $match: filter
                }
            )
        }
        let searchPipeline = pipeline.slice()
        let countPipeline = pipeline.slice()

        searchPipeline.push(
            {
                $sort: sort
            },
            {
                $skip: (page - 1) * resultsPerPage
            },
            {
                $limit: resultsPerPage + 1
            },
            {
                $lookup: {
                    from: "genres",
                    localField: "genres",
                    foreignField: "_id",
                    as: "genres"
                }
            },
            {
                $lookup: {
                    from: "platforms",
                    localField: "platforms",
                    foreignField: "_id",
                    as: "platforms"
                }
            },
            {
                $project: {
                    "platforms.normalizedName": 0,
                    "platforms.createdAt": 0,
                    "platforms.updatedAt": 0,
                    "platforms.__v": 0,
                    "genres.normalizedName": 0,
                    "genres.createdAt": 0,
                    "genres.updatedAt": 0,
                    "genres.__v": 0,
                    "mainImage.public_id": 0,
                    "screenshots.public_id": 0,
                    "screenshots._id": 0,
                    "normalizedName": 0
                }
            }
        )

        result = await gameModel.aggregate(searchPipeline)
        countPipeline.push({$count: "total"})
        let total = await gameModel.aggregate(countPipeline)
        if(total.length === 0){
            totalItems = 0
        }else{
            totalItems = total[0].total
        }
    }else{
        [result, totalItems] = await Promise.all([
            gameModel.find(filter)
                .populate('genres','name')
                // .populate('platforms','name')
                // .select('-mainImage.public_id -screenshots.public_id -screenshots._id -normalizedName')
                .select('-mainImage.public_id -screenshots -normalizedName -platforms -developmentCompany -releaseDate -description -updatedAt')
                .sort(sort)
                .skip((page-1) * resultsPerPage)
                .limit(resultsPerPage + 1),
            gameModel.countDocuments(filter)
        ])
        result = result.map(game => {
            return game.toObject();
        });
    }
    if (result.length > resultsPerPage){
        hasNextPage = true
        result.pop()
    }

    return {
        data: result,
        currentPage: page,
        hasNextPage,
        totalPages: Math.ceil(totalItems/resultsPerPage),
        totalItems
    }

}

const getGame = async (gameId) => {
    let game = await gameModel.findById(gameId)
        .populate('genres', 'name')
        .populate('platforms', 'name')
        .select('-mainImage.public_id -screenshots.public_id -screenshots._id -normalizedName')

    if(!game){
        throw apiErrors.gameNotFound
    }
    let formatedGame = {
        ...game.toObject(),
        releaseDate:game.releaseDate.toLocaleDateString(undefined,{year:"numeric",month:"long", day:"numeric"})
    }
    for(let score in formatedGame.rating){
        formatedGame.rating[score] = Math.round(((formatedGame.rating[score] / formatedGame.numReviews) + Number.EPSILON) * 100) / 100
    }
    return formatedGame;
}

//este se va a usar solo para cuando este escribiendo en el buscador sin darle a submit
const searchGames = async (query) =>{
    console.log(query)
    const result = await gameModel.aggregate([
        {
            $search: {
            autocomplete: {
                query: query,
                path: "name",
                tokenOrder: 'sequential'
            },
            index: "default",
            }
        },
        {
            $project: {
                "_id": 1,
                "name": 1,
                "mainImage.secure_url": 1
            }
        },
        {
            $limit: 5
        }
    ]);

    return result;
}

const getGamesAdmin = async () => {
    let games = await gameModel.find()
        .populate({path: "genres", select: "id name"})
        .populate({path: "platforms", select: "id name"})
        .sort({name: 1, _id: 1})

    return games
}

export default {
    createGame,
    editGame,
    deleteScreenshot,
    deleteGame,
    getGames,
    getGame,
    searchGames,
    getGamesAdmin
}