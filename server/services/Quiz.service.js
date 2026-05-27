import { normalizeName } from "../utils/namedEntitySchema.js"
import quizModel from "../models/Quiz.model.js"
import { apiErrors } from "../utils/apiErrors.js";
import badgeService from "./Badge.service.js";

const createQuiz = async (data) => {
    data.normalizedDifficulty = normalizeName(data.difficulty);
    const isUsed = await badgeService.badgebelongsToQuiz()
    if(isUsed){
        throw apiErrors.badgeInUse;
    }
    let quiz = new quizModel(data);
    await badgeService.asociateBadgeToQuiz(data.badge, quiz._id);
    await quiz.save();
}

const getQuizzes = async (page, sort) => {
    let hasNextPage = false;
    let resultsPerPage = 10;

    let [result, totalItems] = await Promise.all([
        quizModel.find()
            .populate({path: "tags", select: "id name"})
            .populate({path: "badge", select: "id name image.secure_url"})
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
        data: result,
        currentPage: page,
        hasNextPage,
        totalPages: Math.ceil(totalItems/resultsPerPage),
        totalItems: totalItems
    }
}

const editQuiz = async (quizId, data) => {
    data.normalizedDifficulty = normalizeName(data.difficulty);
    const options = {
        new: true,
        runValidators: true
    }
    let quiz = await quizModel.findByIdAndUpdate(quizId, data, options);
    if(!quiz) {
        throw apiErrors.quizNotFound;
    }

    return quiz;
}

const deleteQuiz = async (quizId) => {
    let quiz = await quizModel.findByIdAndDelete(quizId);
    if(!quiz){
        throw apiErrors.quizNotFound;
    };
    await badgeService.deleteBadge(quiz.badge, quiz._id)
}

const getQuiz = async (quizId) => {
    let quiz = await quizModel.findById(quizId);

    if(!quiz){
        throw apiErrors.quizNotFound
    };

    return quiz;
}

const addUserToWinners = async (quizId, userId) => {
    await quizModel.findByIdAndUpdate(quizId, {
        $addToSet: { winners: userId}
    })
}

const getNumQuizzes = async () => {
    return await quizModel.countDocuments()
}

export default {
    createQuiz,
    getQuizzes,
    editQuiz,
    deleteQuiz,
    getQuiz,
    addUserToWinners,
    getNumQuizzes
}