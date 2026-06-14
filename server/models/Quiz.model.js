import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'El nombre de la insignia es requerido'],
    },
    normalizedName:{
        type: String,
        unique: true
    },
    image:{
        public_id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    }
});

const quizSchema = new mongoose.Schema({
    title:{
        type: String,
        required: [true, 'El título es requerido'],
        minLength: [5, 'La longitud mímina del título es 5 caracteres'],
        maxLength: [50, 'La longitud máxima del título es 50 caracteres']
    },
    description:{
        type: String,
        maxLength:[1000, 'La longitud máxima de la descripción es 1000 caracteres']
    },
    difficulty:{
        type: String,
        required: [true, 'La dificultad es requerida'],
        enum: {
            values: ['Fácil', 'Intermedio', 'Difícil'],
            message: '{VALUE} no es correcto'
        }
    },
    tags: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: "Tag"
        }],
        required: [true, 'La lista de etiquetas es requerida'],
        validate: [array => array.length > 0, 'Debe tener al menos una etiqueta']
    },
    numQuestions:{
        type: Number,
        min:[10,'El número minimo de preguntas es 10'],
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} debe ser un valor entero'
        }
    },
    // badge:{
    //     type: mongoose.Types.ObjectId,
    //     ref: 'Badge',
    //     require: [true, 'La insignia es requerida']
    // },
    badge: badgeSchema,
    // winners: {
    //     type: [{
    //         type: mongoose.Types.ObjectId,
    //         ref: 'User'
    //     }],
    //     default: []
    // }
}, {
    timestamps: true
})

quizSchema.index({createdAt: -1, _id: 1});
const Quiz = mongoose.model('Quiz', quizSchema)

export default Quiz;