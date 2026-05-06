import quizSessionService from "../services/QuizSession.service.js";

const createSession = async (req, res, next) => {
    try {
        const quizId = req.params.quizId;

        let session = await quizSessionService.createSession(quizId,req.uid);

        return res.status(200).json({
            msg: "Sesión creada",
            sessionId: session.id,
            question: session.questions[0],
            expiresAt: session.expiresAt
        })
    } catch (error) {
        next(error)
    }
}

const answerQuestion = async (req,res,next) => {
    try {
        const sessionId = req.params.sessionId;
        let session = await quizSessionService.answerQuestion(sessionId, req.body.answer);
        console.log(session)
        if(session.finished){
            return res.status(200).json({
                msg: "Prueba finalizada",
                score: session.correctAnswers
            })
        }
        return res.status(200).json({
            sessionId: session.id,
            question: session.questions[session.currentQuestionIndex]
        })
    } catch (error) {
        next(error)
    }
}

export default {
    createSession,
    answerQuestion
}