import questionModel from '../models/Question.model.js'
import { apiErrors } from '../utils/apiErrors.js';
import tagModel from '../models/Tag.model.js';
import { normalizeName } from "../utils/namedEntitySchema.js";
import { deleteImage, uploadImage } from '../utils/cloudinary.js';
import fs from 'fs-extra'

const getQuestions = async () => {
    // let hasNextPage = false;
    // let resultsPerPage = 20;

    // let [result, totalItems] = await Promise.all([
    //     questionModel.find()
    //         .populate({path: "tags", select: "id name"})
    //         .sort({question: 1, _id: 1})
    //         .skip((page - 1) * resultsPerPage)
    //         .limit(resultsPerPage + 1),
    //     questionModel.countDocuments()
    // ])
    const result = await questionModel.find()
        .populate({path: "tags", select: "id name"})
        .sort({question: 1, _id: 1})


    // if(result.length > resultsPerPage){
    //     hasNextPage = true
    //     result.pop()
    // }

    // return {
    //     data: result,
    //     currentPage: page,
    //     hasNextPage,
    //     totalPages: Math.ceil(totalItems/resultsPerPage),
    //     totalItems: totalItems
    // }
    return result
}

const getQuestion = async (questionId) => {
    let question = await questionModel.findById(questionId)
        .populate({path: "tags", select: "id name"});

    if(!question){
        throw apiErrors.questionNotFound;
    }

    return question;
}

const getRandomQuestions = async (tags, difficulty, numQuestions) => {
    const pipeline = [
        {
            $match: {
                $and: [
                    {tags: {$in: tags}},
                    {difficulty: difficulty}
                ]
            }
        },
        {
            $sample: { size: numQuestions }
        }
    ]

    let result = await questionModel.aggregate(pipeline)

    return result
}

const createQuestion = async (data, file) => {
    let question = new questionModel(data);
    await question.validate();

    if(file){    
        let result = await uploadImage(file.path, 'questions',null, 'image');
        question.image = {
            public_id: result.public_id,
            secure_url: result.secure_url
        }
        await fs.unlink(file.path)
    }

   return await question.save()
}

const editQuestion = async (questionId, data, file) => {
    let uploadedImages = [];
    try {
        let question = await questionModel.findById(questionId);
        if(!question){
            throw apiErrors.questionNotFound;
        }

        question.question = data.question;
        question.answer = data.answer;
        question.distractors = data.distractors;
        question.tags = data.tags;
        question.difficulty = data.difficulty;
        await question.validate()
   
        if(file){
            const result = await uploadImage(file.path, 'questions', null, 'image');
            uploadedImages.push(result.public_id)
            if(question.image.public_id){
                await deleteImage(question.image.public_id);
            }
            question.image = {
                public_id: result.public_id,
                secure_url: result.secure_url
            }
            await fs.unlink(file.path)
        }
        return await question.save()
    } catch (error) {
        if(uploadedImages.length >= 1){
            await deleteImage(uploadedImages[0])
        }
        throw error
    }
}

const deleteQuestion = async (questionId) => {
    let question = await questionModel.findByIdAndDelete(questionId);

    if(!question){
        throw apiErrors.questionNotFound;
    }
    if(question.image.public_id){
        await deleteImage(question.image.public_id)
    }

}

const isCorrectAnswer = async (questionId, answer) => {
    let question = await questionModel.findById(questionId);
    console.log('PREGUNTA: ', question)
    console.log(question.answer === answer)
    if(question.answer === answer){
        return true
    }
    return false
}


export default {
    getQuestions,
    getQuestion,
    getRandomQuestions,
    createQuestion,
    editQuestion,
    deleteQuestion,
    isCorrectAnswer
}