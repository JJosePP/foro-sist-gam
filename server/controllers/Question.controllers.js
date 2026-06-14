
import questionService from "../services/Question.service.js";

const getQuestions = async (req,res,next) => {
    try {
        // let page = Math.floor(req.query.page) || 1;
        // if(page < 1) {page = 1}
        let result = await questionService.getQuestions();

        return res.status(200).json({result})
    } catch (error) {
        next(error)
    }
}

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
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
            console.log("QuestionObject: ", questionObject)
            console.log("Answer: ", answer)
            console.log("distractors: ", distractors)
            console.log("formatedQuestion: ", formatedQuestion)
            let possibleAnswers = [answer, ...distractors];
            shuffle(possibleAnswers)
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

        
        let question = await questionService.createQuestion(data, req.files[0]);
        let q = await question.populate({path: "tags", select: "id name"})

        return res.status(200).json({
            msg: "Pregunta creada correctamente",
            createdQuestion: q
        })
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
        let question = await questionService.editQuestion(questionId, data, req.files[0])
        let q = await question.populate({path: "tags", select: "id name"})
        return res.status(200).json({
            msg: "Pregunta editada con éxito", 
            editedQuestion: q})
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