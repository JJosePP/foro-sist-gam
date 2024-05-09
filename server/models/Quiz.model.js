import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        minLength: [5, 'La longitud mímina del título es 5 caracteres'],
        maxLength: [20, 'La longitud máxima del título es 20 caracteres']
    },
    description:{
        type: String,
        maxLength:[100, 'La longitud máxima de la descripción es 100 caracteres']
    },
    difficulty:{
        type: String,
        required: true,
        enum: {
            values: ['Fácil', 'Intermedio', 'Difícil'],
            message: '{VALUE} no es correcto'
        }
    },
    tags:[{
        type: String,
        required: true
    }],
    numQuestions:{
        type: Number,
        min:[10,'El número minimo de preguntas es 10']
    },
    badge:{
        type: mongoose.Types.ObjectId,
        ref: 'Badge',
        require: true
    }
}, {
    timestamps: true
})

const Quiz = mongoose.model('Quiz', quizSchema)

export default Quiz;