import { query, body } from "express-validator";

export const queryFieldsValidator = [
    query("tags")
        .isArray({min: 1}).withMessage("Debe indicar al menos una etiqueta")
        .bail(),
    query("tags.*")
        .trim()
        .notEmpty().withMessage("Los elementos de la lista de etiquetas no puede estar vacíos"),
    query("difficulty")
        .trim()
        .notEmpty().withMessage("Debe indicar una dificultad")
        .bail()
        .isIn(["facil", "intermedio", "dificil"]).withMessage("Los valores permitidos son: facil,intermedio y dificil")
]

export const questionValidator = [
    body("question")
        .isString().withMessage("La pregunta debe ser texto")
        .bail()
        .trim()
        .notEmpty().withMessage("La pregunta no puede estar vacía")
        .bail()
        .isLength({min:1, max: 300}).withMessage("La pregunta debe contener entre 1 y 300 caracteres"),
    body("answer")
        .isString().withMessage("La respuesta debe ser texto")
        .bail()
        .trim()
        .notEmpty().withMessage("La respuesta no puede estar vacía")
        .bail()
        .isLength({min:1, max: 150}).withMessage("La respuesta debe contener entre 1 y 150 caracteres"),
    body("distractors")
        .custom(value => Array.isArray(value) && value.length===3).withMessage("Debe introducir una lista de longitud 3 de respuestas distractoras"),
    body("distractors.*")
        .isString().withMessage("La respuesta distractora debe ser texto")
        .bail()
        .trim()
        .notEmpty().withMessage("La respuesta distractora no puede estar vacía")
        .bail()
        .isLength({min:1, max: 150}).withMessage("La respuesta distractora debe contener entre 1 y 150 caracteres"),
    body("tags")
        .isArray({min:1}).withMessage("Debe introducir una lista de etiquetas"),
    body("tags.*")
        .isString().withMessage("El elemento del array debe ser un identificador en formato texto")
        .bail()
        .trim()
        .notEmpty().withMessage("El elemento del array no puede ser vacío")
        .bail()
        .isMongoId().withMessage("El identificador proporcionado no tiene un formato válido (cadena hexadecimal de 24 caracteres)"),
    body("difficulty")
        .isString().withMessage("La dificultad debe ser texto")
        .bail()
        .trim()
        .isIn(["Fácil", "Intermedio", "Difícil"]).withMessage("Los valores permitidos son: Fácil,Intermedio y Difícil")
];
