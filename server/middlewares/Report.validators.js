import { body } from "express-validator";

export const reportValidator = [
    body("reason")
        .isString().withMessage("El motivo debe ser texto")
        .bail()
        .trim()
        .notEmpty().withMessage("Debe explicar el motivo")
        .bail()
        .isLength({min:1, max: 1000}).withMessage("El motivo debe contener entre 1 y 1000 caracteres"),
    body("urlToPost")
        .isString().withMessage("El enlace hacia la publicación debe ser texto")
        .bail()
        .trim()
        .notEmpty().withMessage("El enlace hacia la publicación no puede estar vacío")
]