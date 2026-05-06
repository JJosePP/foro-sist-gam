import mongoose from "mongoose";

const quizSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    quiz: {
        type: mongoose.Types.ObjectId,
        ref: 'Quiz',
        required: true,
        index: true
    },
    questions: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: 'Question'
        }],
        required: true
    },
    currentQuestionIndex: {
        type: Number,
        default: 0
    },
    correctAnswers: {
        type: Number,
        default: 0
    },
    startedAt: {
        type: Date,
        default: Date.now(),
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true,
        expires: 300
    },
    finished: {
        type: Boolean, 
        default: false,
        index: true
    },
    passed: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

const quizSession = mongoose.model("QuizSession", quizSessionSchema);

export default quizSession;