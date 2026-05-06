
import questionService from "../services/Question.service.js";

const getQuestions = async (req,res,next) => {
    try {
        let page = Math.floor(req.query.page) || 1;
        if(page < 1) {page = 1}
        let result = await questionService.getQuestions(page);

        return res.status(200).json({result})
    } catch (error) {
        next(error)
    }
}

const getQuestion = async (req,res,next) =>{
    try {
        let question = await questionService.getQuestion(req.params.questionId);

        if(req.roles.includes("administrator")) {
            return res.status(200).json({question})
        }else{
            let questionObject = question.toObject();

            let {answer, distractors, ...formatedQuestion} = questionObject;

            let possibleAnswers = [answer, ...distractors]
            formatedQuestion.possibleAnswers = possibleAnswers;

            return res.status(200).json({formatedQuestion})
        }
    } catch (error) {
        next(error)
    }
}

const createQuestion = async (req,res,next) => {
    try {   
        const data = {
            question: req.body.question,
            answer: req.body.answer,
            distractors: req.body.distractors,
            tags: req.body.tags,
            difficulty: req.body.difficulty
        }

        await questionService.createQuestion(data, req.files[0]);

        return res.status(200).json({msg: "Pregunta creada correctamente"})
    } catch (error) {
        next(error)
    }
}

const editQuestion = async (req,res,next) => {
    try {
        const questionId = req.params.questionId;
        const data = {
            question: req.body.question,
            answer: req.body.answer,
            distractors: req.body.distractors,
            tags: req.body.tags,
            difficulty: req.body.difficulty
        }
       let q = await questionService.editQuestion(questionId, data, req.files[0])

        return res.status(200).json({msg: "Pregunta editada con éxito", q})
    } catch (error) {
        next(error)
    }
}

const deleteQuestion = async (req,res,next) => {
    try {
        await questionService.deleteQuestion(req.params.questionId);
        return res.status(200).json({msg: "Pregunta eliminada con éxito"})
    } catch (error) {
        next(error)
    }
}


export default {
    getQuestions,
    getQuestion,
    createQuestion,
    editQuestion,
    deleteQuestion
}