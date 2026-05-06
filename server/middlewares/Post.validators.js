import { param, body } from "express-validator";

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