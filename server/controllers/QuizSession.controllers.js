import quizSessionService from "../services/QuizSession.service.js";

const createSession = async (req, res, next) => {
    try {
        const quizId = req.params.quizId;

        let session = await quizSessionService.createSession(quizId,req.uid);

        return res.status(200).json({
            msg: "Sesión creada",
            sessionId: session.id,
            currentQuestionIndex: session.currentQuestionIndex,
            question: session.questions[0],
            expiresAt: session.expiresAt,
            numQuestions: session.questions.length
        })
    } catch (error) {
        next(error)
    }
}

const answerQuestion = async (req,res,next) => {
    try {
        const sessionId = req.params.sessionId;
        console.log(sessionId)
        let session = await quizSessionService.answerQuestion(sessionId, req.body.answer);
        console.log(session)
        if(session.finished){
            return res.status(200).json({
                msg: "Prueba finalizada",
                score: session.correctAnswers,
                passed: session.passed
            })
        }
        return res.status(200).json({
            sessionId: session.id,
            currentQuestionIndex: session.currentQuestionIndex,
            question: session.questions[session.currentQuestionIndex],
            numQuestions: session.questions.length

        })
    } catch (error) {
        next(error)
    }
}

const getSession = async (req,res,next) => {
    try {
        console.log(req.params)
        const session = await quizSessionService.getSession(req.params.sessionId, req.uid)
        return res.status(200).json({
            sessionId: session._id,
            currentQuestionIndex: session.currentQuestionIndex,
            question: session.questions[session.currentQuestionIndex],
            expiresAt: session.expiresAt,
            numQuestions: session.questions.length

        })
    } catch (error) {
        next(error)
    }
}

const endSession = async (req,res,next) => {
    try {
        await quizSessionService.endSession(req.params.sessionId, req.uid)
        return res.status(200).json({msg: "Sesión finalizada"})
    } catch (error) {
        next(error)
    }
}
export default {
    createSession,
    answerQuestion,
    getSession,
    endSession
}