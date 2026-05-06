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
    let randomQuestions = await questionService.getRandomQuestions(quiz.tags, quiz.normalizedDifficulty, quiz.numQuestions);

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

    if(session.currentQuestionIndex >= session.questions.length){
        session.finished = true;
        const passingScore = Math.ceil(session.questions.length * 0.8);

        if(session.correctAnswers >= passingScore){
            session.passed = true;
            let quiz = await quizService.getQuiz(session.quiz);

            await Promise.all([
                userService.addBadgeToUser(quiz.badge,session.user),
                badgeService.insertUserToBadge(quiz.badge, session.user),
                quizService.addUserToWinners(session.quiz, session.user)
            ]);
        }
    }
    return await session.save();
}

export default {
    createSession,
    answerQuestion
}