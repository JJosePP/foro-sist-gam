import fs from 'fs-extra';
import { normalizeName } from '../utils/namedEntitySchema.js';
import userModel from '../models/User.model.js';
import gameModel from '../models/Game.model.js';
import reviewModel from '../models/Review.model.js';
import { deleteImage, uploadImage } from '../utils/cloudinary.js';
import categoryModel from '../models/Category.model.js';
import threadModel from '../models/Thread.model.js';
import replyModel from '../models/Reply.model.js';
import platformModel from '../models/Platform.model.js';
import genreModel from '../models/Genre.model.js';
import questionModel from '../models/Question.model.js';

const populateUsers = async () => {
    let uploadedImages = [];
    try {
        const users = JSON.parse(fs.readFileSync('./utils/users.json', 'utf-8'));
        console.log("Llega")
        
        for(let user of users){
            user.normalizedUserName = normalizeName(user.userName)
            if(user.profilePic){
                let res = await uploadImage(user.profilePic, 'profile', null, 'profile');
                uploadedImages.push(res.public_id)
                user.profilePic = {
                    public_id: res.public_id,
                    secure_url: res.secure_url
                }
            }else{
                user.profilePic = {
                public_id: process.env.DEFAULT_PIC_ID,
                    secure_url: process.env.DEFAULT_PIC_URL
                }
            }
            await userModel.create(user)
        }
    } catch (error) {
        console.log(error)
        if(uploadedImages.length > 0){
            uploadedImages.forEach(async (i) => await deleteImage(i))
        }
        throw error
    }

}

const populateReviews = async () => {
    let cont = 0
    const reviews = JSON.parse(fs.readFileSync('./utils/reviews.json', 'utf-8'));
    for(let review of reviews){
        cont++

        let userName = normalizeName(review.user)
        let gameName = review.game
                .replaceAll(/[^a-zA-Z0-9\s\+]/g,' ')
                .replaceAll(/\s* \s*/g,'-').toLowerCase();
        console.log(userName)
        console.log(gameName)
        let user = await userModel.exists({normalizedUserName: userName});
        let game = await gameModel.findOne({normalizedName: gameName})
        review.user = user._id;
        review.game = game._id;
        console.log(review)

        await reviewModel.create(review)

        await game.updateOne({
            $inc: {
                "rating.overall": review.rating.overall,
                "rating.story": review.rating.story,
                "rating.gameplay": review.rating.gameplay,
                "rating.technicalSection": review.rating.technicalSection,
                "rating.art": review.rating.art,
                "rating.sound": review.rating.sound,
                numReviews: 1
            }
        })
    }
    console.log(cont)
}
const populateCategories = async () => {
    const categories = JSON.parse(fs.readFileSync('./utils/categories.json', 'utf-8'));
    await categoryModel.insertMany(categories)
}
const populateThreads = async () => {
    const threads = JSON.parse(fs.readFileSync('./utils/threads.json', 'utf-8'))
    for(let thread of threads){
        let userName = normalizeName(thread.user)
        let categoryName = normalizeName(thread.category)
        let user = await userModel.exists({normalizedUserName: userName});
        let category = await categoryModel.findOne({normalizedName: categoryName})

        thread.user = user._id;
        thread.category = category._id
        console.log(thread)
        await threadModel.create(thread)
    }
}

const populateReplies = async () => {
    const replies = JSON.parse(fs.readFileSync('./utils/replies.json', 'utf-8'));
    for(let reply of replies){
        let userName = normalizeName(reply.user);
        let user = await userModel.exists({normalizedUserName: userName});
        let thread = await threadModel.findOne({title: reply.thread});

        reply.user = user._id;
        reply.thread = thread._id

        console.log(reply);
        await replyModel.create(reply)
    }
}

const populateGames = async () => {
    const file = JSON.parse(fs.readFileSync('./utils/games.json', 'utf-8'));
        console.log("----GAMES----")
        const games = file.games
        for (let game of games) {
            let uploadedImages = [];
            let platformsIds = [];
            let genresIds = [];
            console.log(game.name)
            console.log("----Platforms----")
            for (let platformName of game.platforms) {
                console.log(platformName)
                let platform = await platformModel.exists({normalizedName: platformName});
                console.log(platform)
                platformsIds.push(platform._id);
            }
            console.log(platformsIds)
            console.log("----Genres----")
            for (let genreName of game.genres) {
                let genre = await genreModel.exists({normalizedName:genreName});
                genresIds.push(genre._id);
            }
            console.log(genresIds)
            let normalizedGameName = game.name
                .replaceAll(regex_to_remove_special_chars,' ')
                .replaceAll(regex_to_remove_white_spaces,'-').toLowerCase();
            const gameToCreate = new gameModel({
                name: game.name,
                developmentCompany: game.developmentCompany,
                releaseDate: game.releaseDate,
                description: game.description,
                platforms: platformsIds,
                genres: genresIds,
                normalizedName: normalizedGameName
                        
            })
            let mainImageRes = await uploadImage(game.mainImage, 'games',gameToCreate.id, 'mainImage')
            gameToCreate.mainImage = {
                public_id: mainImageRes.public_id,
                secure_url: mainImageRes.secure_url
            }
            await gameToCreate.validate();

            console.log("----Screenshots----")
            for (let imagePath of game.localImages) {
                let result = await uploadImage(imagePath,'games', gameToCreate.id, 'screenshot');
                uploadedImages.push({
                    public_id: result.public_id,
                    secure_url: result.secure_url
                })
            }  
            gameToCreate.screenshots = uploadedImages;
            
            console.log("AQUI LLEGA")
            await gameToCreate.save();
        }
}

const populateGenres = async () => {
        const file = JSON.parse(fs.readFileSync('./utils/genres.json', 'utf-8'));
        const genres = file.genres;
        for(let genre of genres){
            await genreModel.create({
                name: genre.name,
                normalizedName: normalizeName(genre.name)
            })
        }
}

const populatePlatforms = async () => {
        const file = JSON.parse(fs.readFileSync('./utils/platforms.json', 'utf-8'));
        const platforms = file.platforms;
        for(let platform of platforms){
            await platformModel.create({
                name: platform.name,
                normalizedName: normalizeName(platform.name)
            })
        }
}

const populateQuestions = async () => {
    let contador ={
        facil: 0,
        intermedio: 0,
        dificil: 0
    }
    const questions = JSON.parse(fs.readFileSync('./utils/questions.json', 'utf-8'));
    for(let question of questions){
        question.normalizedDifficulty = normalizeName(question.difficulty)
        console.log(question)
        contador[question.normalizedDifficulty]++;
        console.log(contador)
        await questionModel.create(question)
    }
}



export default {
    populateUsers,
    populateReviews,
    populateCategories,
    populateThreads,
    populateReplies,
    populatePlatforms,
    populateQuestions,
    populateGenres,
    populateGames
}