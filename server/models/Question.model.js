import mongoose from "mongoose";
import validator from "validator";

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        mingLength: [1, "La longitud mínima de la pregunta es 1 carácter"],
    },
    answer: {
        type: String,
        required: true,
        mingLength: [1, "La longitud mínima de la respuesta es 1 carácter"],
    },
    distractors: {
        type: [
            {
                type: String,
                required: true,
                mingLength: [
                    1,
                    "La longitud mínima de la respuesta distractora es 1 carácter",
                ],
            },
        ],
        validate: {
            validator: function (v) {
                return v.length === 3;
            },
            message: "Debe haber 3 respuestas distractoras",
        },
    },
    tags: [
        {
            type: String,
            required: true,
        },
    ],
    difficulty: {
        type: String,
        required: true,
        enum: {
            values: ["Fácil", "Intermedio", "Difícil"],
            message: "{VALUE} no es correcto",
        },
    },
    image: {
        public_id: {
            type: String,
        },
        secure_url: {
            type: String,
        },
    },
});
