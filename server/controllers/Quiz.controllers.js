import quizService from '../services/Quiz.service.js';

const createQuiz = async(req,res,next) => {
    try {
        const data = {
            title: req.body.title,
            description: req.body.description,
            difficulty: req.body.difficulty,
            tags: req.body.tags,
            numQuestions: req.body.numQuestions,
            badge: req.body.badge
        };

        await quizService.createQuiz(data);
        return res.status(200).json({msg: "Prueba creada con éxito"});
    } catch (error) {
        next(error);
    }
}

const getQuizzes = async (req,res,next) => {
    try {
        let page = Math.floor(req.query.page) || 1;
        let order = req.query.order;
        if(page < 1) {page = 1};
        const sortOrder = order === 'asc' ? 1: -1;
        const sort = {createdAt: sortOrder, _id: -sortOrder};

        let result = await quizService.getQuizzes(page, sort);

        return res.status(200).json({result});
    } catch (error) {
        next(error)
    }
}

const editQuiz = async (req,res,next) => {
    try {
        const data = {
            title: req.body.title,
            description: req.body.description,
            difficulty: req.body.difficulty,
            tags: req.body.tags,
            numQuestions: req.body.numQuestions
        };
        let quiz = await quizService.editQuiz(req.params.quizId, data);
        return res.status(200).json({msg: "Prueba editada con éxito", quiz})
    } catch (error) {
        next(error)
    }
}

const deleteQuiz = async(req,res,next) => {
    try {
        await quizService.deleteQuiz(req.params.quizId);
        return res.status(200).json({msg: "Prueba eliminada con éxito"})
    } catch (error) {
        next(error)
    }
}

const getNumQuizzes = async (req,res,next) => {
    try {
        let numQuizzes = await quizService.getNumQuizzes();
        return res.status(200).json({totalQuizzes: numQuizzes})
    } catch (error) {
        next(error)
    }
}

export default {
    createQuiz,
    getQuizzes,
    editQuiz,
    deleteQuiz,
    getNumQuizzes
}