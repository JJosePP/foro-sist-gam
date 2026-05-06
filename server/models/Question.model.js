import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'La pregunta es requerida'],
        minLength: [1, "La longitud mínima de la pregunta es 1 caracter"],
        maxLength: [300, "La longitud máxima de la pregunta es 300 caracteres"]
    },
    answer: {
        type: String,
        required: [true, 'La respuesta es requerida'],
        minLength: [1, "La longitud mínima de la respuesta es 1 carácter"],
        maxLength: [150, "La longitud máxima de la respuesta es 150 caracteres"]
    },
    distractors: {
        type: [
            {
                type: String,
                required: [true, 'Las respuestas distractoras son requeridas'],
                mingLength: [
                    1,
                    "La longitud mínima de la respuesta distractora es 1 caracter",
                ],
                maxLength: [150, "La longitud máxima de la respuesta distractora es 150 caracteres"]
            },
        ],
        validate: {
            validator: function (v) {
                return v.length === 3;
            },
            message: "Debe haber 3 respuestas distractoras",
        },
    },
    tags: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: "Tag"
        }],
        required: [true, 'La lista de etiquetas es requerida'],
        validate: [array => array.length > 0, 'Debe tener al menos una etiqueta'],
    },
    difficulty: {
        type: String,
        required: [true, 'La dificultad es requerida'],
        enum: {
            values: ["Fácil", "Intermedio", "Difícil"],
            message: "{VALUE} no es correcto",
        },
    },
    normalizedDifficulty: {
        type: String
    },
    image: {
        public_id: {
            type: String,
        },
        secure_url: {
            type: String,
        },
    },
}, {
    timestamps: true
});

questionSchema.index({question: 1, _id: 1});
questionSchema.index({tags: 1, normalizedDifficulty: 1});

const Question = mongoose.model('Question', questionSchema)

export default Question;