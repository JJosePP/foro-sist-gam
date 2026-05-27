import { param, body, query } from "express-validator";

export const voteValidator = [
    param("vote")
        .isString().withMessage("El parámetro debe ser texto")
        .bail()
        .trim()
        .notEmpty().withMessage("El voto es requerido")
        .bail()
        .isIn(["1", "-1"]).withMessage("Los valores permitidos son 1 o -1")
]

export const moderateValidator = [
    body("reason")
        .isString().withMessage("El parámetro debe ser texto")
        .bail()
        .trim()
        .notEmpty().withMessage("La razón de la moderación es requerida")
        .bail()
        .isIn(['Ofensivo', 'Spam', 'Fuera de tema', 'Lenguaje inapropiado']).withMessage("Los valores permitidos son: 'Ofensivo', 'Spam', 'Fuera de tema' y 'Lenguaje inapropiado'")
]
export const postUserValidator = [
    query("user")
        .trim()
        .notEmpty().withMessage("El identificador del usuario es obligatorio")
        .isMongoId().withMessage("El identificador proporcionado no tiene un formato válido (cadena hexadecimal de 24 caracteres)")
]