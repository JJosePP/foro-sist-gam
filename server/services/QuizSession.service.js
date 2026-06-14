import quizService from "./Quiz.service.js";
import questionService from "./Question.service.js";
import quizSessionModel from "../models/QuizSession.model.js";
import { apiErrors } from "../utils/apiErrors.js";
import userService from "./User.service.js";
import badgeService from "./Badge.service.js";

const createSession = async (quizId, uid) => {
    const QUIZ_DURATION = 15;

    const activeSession = await quizSessionModel.findOne({
        user: uid,
        quiz: quizId,
        finished: false,
        expiresAt: {$gt: new Date()}
    })

    if(activeSession){
        throw apiErrors.activeSession;
    }

    let quiz = await quizService.getQuiz(quizId);
    let randomQuestions = await questionService.getRandomQuestions(quiz.tags, quiz.difficulty, quiz.numQuestions);

    const session = await quizSessionModel.create({
        user: uid,
        quiz: quizId,
        questions: randomQuestions,
        expiresAt: new Date(Date.now() + QUIZ_DURATION * 60 * 1000)
    })

    return session
}

const answerQuestion = async(sesiondId, userAnswer) => {
    const session = await quizSessionModel.findById(sesiondId);
    if(!session){
        apiErrors.sessionNotFound;
    }
    if(session.finished){
        throw apiErrors.finishedSession
    }
    if(Date.now() > session.expiresAt){
        session.finished = true;
        await session.save()
        throw apiErrors.expiredSession
    }
    const currentQuestionId = session.questions[session.currentQuestionIndex]
    let isCorrectAnswer = await questionService.isCorrectAnswer(currentQuestionId, userAnswer)
    
    if(isCorrectAnswer){
        session.correctAnswers++;
    }

    session.currentQuestionIndex++;
    //probar porque creo que la ultima pregunta no se responde. Creo que debe ser >
    if(session.currentQuestionIndex >= session.questions.length){
        session.finished = true;
        const passingScore = Math.ceil(session.questions.length * 0.8);

        if(session.correctAnswers >= passingScore){
            session.passed = true;
            // let quiz = await quizService.getQuiz(session.quiz);

            // await Promise.all([
            //     // userService.addBadgeToUser(quiz.badge._id,session.user),
            //     // badgeService.insertUserToBadge(quiz.badge, session.user),
            //     // quizService.addUserToWinners(session.quiz, session.user)
            //     userService.markQuizAsCompleted(session.quiz, session.user)
            // ]);
            await userService.markQuizAsCompleted(session.quiz, session.user)
        }
    }
    console.log("QUESTION INDEX: ", session.currentQuestionIndex)
    return await session.save();
}

const getSession = async (sessionId,uid) => {
    const sessions = await quizSessionModel.find({
        $and: [
            {_id: sessionId},
            {user: uid}
        ]
    });
    const session = sessions[0];
    console.log('SESION: ',sessions)

    if(!session){
        apiErrors.sessionNotFound;
    }

    if(Date.now() > session.expiresAt){
        session.finished = true;
        await session.save()
        throw apiErrors.expiredSession
    }

    return session
}

const endSession = async (sessionId, uid) => {
    const activeSession = await quizSessionModel.findOne({
        _id:sessionId,
        user: uid,
        finished: false,
        expiresAt: {$gt: new Date()}
    })
    if(!activeSession){
        throw apiErrors.sessionNotFound;
    }

    activeSession.finished = true
    await activeSession.save()
}
export default {
    createSession,
    answerQuestion,
    getSession,
    endSession
}