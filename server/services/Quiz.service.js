import { normalizeName } from "../utils/namedEntitySchema.js"
import quizModel from "../models/Quiz.model.js"
import { apiErrors } from "../utils/apiErrors.js";

import { deleteImage, uploadImage } from "../utils/cloudinary.js";
import fs from 'fs-extra';
import userService from "./User.service.js";

const createQuiz = async (data, file) => {

    let uploadedImage = null;
    try {
        let normalizedBadgeName = normalizeName(data.badge.name);
        let existingBadge = await quizModel.exists({"badge.normalizedName": normalizedBadgeName});
        if(existingBadge){
            throw apiErrors.existingBadge
        }
        data.badge.normalizedName = normalizedBadgeName;
        let quiz = new quizModel(data);
        let result = await uploadImage(file.path, 'badges', null, 'image');
        uploadedImage = result.public_id
        quiz.badge.image = {
            public_id: result.public_id,
            secure_url: result.secure_url
        }
        await fs.unlink(file.path)

        return await quiz.save();
    } catch (error) {
        if(uploadedImage){
            await deleteImage(uploadedImage)
        }
        throw error;
    }
}

const getQuizzes = async (page, sort, admin) => {
    let hasNextPage = false;
    let resultsPerPage = 10;
    console.log(admin == true)
    console.log(typeof admin)

    if(admin === 'true'){
        let result = await quizModel.find()
            .populate({path: "tags", select: "id name"})
            .sort({title: 1, _id: 1})
            .select('_id title tags difficulty')

        return result
    }else {
        let [result, totalItems] = await Promise.all([
            quizModel.find()
                .populate({path: "tags", select: "id name"})
                // .populate({path: "badge", select: "id name image.secure_url"})
                .sort(sort)
                .skip((page - 1) * resultsPerPage)
                .limit(resultsPerPage + 1),
            quizModel.countDocuments()
        ]);
    
        if(result.length > resultsPerPage){
            hasNextPage = true
            result.pop()
        }
    
        return {
            quizzes: result,
            currentPage: page,
            hasNextPage,
            totalPages: Math.ceil(totalItems/resultsPerPage),
            totalItems: totalItems
        }
    }
}

const getQuizzesAdmin = async () => {
    let result = await quizModel.find()
            .populate({path: "tags", select: "id name"})
            .sort({title: 1, _id: 1})

    return result
}
const editQuiz = async (quizId, body, file) => {
    let uploadedImage = null;
    try {
        let quiz = await quizModel.findById(quizId);
        if(!quiz) {
            throw apiErrors.quizNotFound;
        }
        quiz.title = body?.title;
        quiz.description = body?.description;
        quiz.difficulty = body?.difficulty;
        quiz.tags = body?.tags;
        quiz.numQuestions = body?.numQuestions;
        quiz.badge.name = body?.badgeName;
        quiz.badge.normalizedName = normalizeName(body?.badgeName);

        if(file) {
            const result = await uploadImage(file.path, 'badges', null, 'image');
            uploadedImage = result.public_id;
            await deleteImage(quiz.badge.image.public_id);
            quiz.badge.image = {
                public_id: result.public_id,
                secure_url: result.secure_url
            }
            await fs.unlink(file.path)
        }
        return await quiz.save()
        // const options = {
        //     new: true,
        //     runValidators: true
        // }
        // let quiz = await quizModel.findByIdAndUpdate(quizId, data, options);
        // if(!quiz) {
        //     throw apiErrors.quizNotFound;
        // }

        // return quiz; 
    } catch (error) {
        if(uploadedImage){
            await deleteImage(uploadedImage)
        }
        throw error;
    }

}

const deleteQuiz = async (quizId) => {
    let quiz = await quizModel.findById(quizId);
    if(!quiz){
        throw apiErrors.quizNotFound;
    };


    await quiz.deleteOne();
    await deleteImage(quiz.badge.image.public_id)
    await userService.removeQuizFromUsers(quiz._id)
}

const getQuiz = async (quizId) => {
    let quiz = await quizModel.findById(quizId);

    if(!quiz){
        throw apiErrors.quizNotFound
    };

    return quiz;
}

// const addUserToWinners = async (quizId, userId) => {
//     await quizModel.findByIdAndUpdate(quizId, {
//         $addToSet: { winners: userId}
//     })
// }
const getNumQuizzes = async () => {
    return await quizModel.countDocuments()
}

export default {
    createQuiz,
    getQuizzes,
    editQuiz,
    deleteQuiz,
    getQuiz,
    // addUserToWinners,
    getNumQuizzes,
    getQuizzesAdmin
}