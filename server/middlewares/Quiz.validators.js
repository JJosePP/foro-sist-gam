import { body } from "express-validator";


export const partialQuizValidator = [
    body("title")
        .isString().withMessage("El título debe ser texto")
        .bail()
        .trim()
        .notEmpty().withMessage("El título no puede estar vacío")
        .bail()
        .isLength({min: 5, max: 50}).withMessage("El título debe contener entre 5 y 50 caracteres"),
    body("description")
        .optional()
        .isString().withMessage("La descripción debe ser texto")
        .bail()
        .trim()
        .isLength({max: 1000}).withMessage("La La descripción tiene 1000 caracteres como máximo"),
    body("difficulty")
        .isString().withMessage("La dificultad debe ser texto")
        .bail()
        .trim()
        .isIn(["Fácil", "Intermedio", "Difícil"]).withMessage("Los valores permitidos son: Fácil,Intermedio y Difícil"),
    body("tags")
        .isArray({min:1}).withMessage("Debe introducir una lista de etiquetas"),
    body("tags.*")
        .isString().withMessage("El elemento del array debe ser un identificador en formato texto")
        .bail()
        .trim()
        .notEmpty().withMessage("El elemento del array no puede ser vacío")
        .bail()
        .isMongoId().withMessage("El identificador proporcionado no tiene un formato válido (cadena hexadecimal de 24 caracteres)"),
    body("numQuestions")
        .notEmpty().withMessage("El número de preguntas es obligatorio")
        .bail()
        .isInt({min: 10}).withMessage("El tipo de dato deber ser un número entero mayor o igual que 10")
];

export const quizValidator = [
    ...partialQuizValidator,
    body("badge")
        .isString().withMessage("El emblema debe ser un identificador en formato texto")
        .bail()
        .notEmpty().withMessage("El emblema no puede ser vacío")
        .bail()
        .isMongoId().withMessage("El identificador proporcionado no tiene un formato válido (cadena hexadecimal de 24 caracteres)")
];