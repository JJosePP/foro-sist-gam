import { body } from "express-validator";
import { contentValidator } from "./commonValidators.js";

const ratingValidator = (rating) => {
    return body(rating)
        .notEmpty().withMessage("La puntuación es requerida")
        .bail()
        .isInt({min:1,max:100}).withMessage("El tipo de dato debe ser un número entero entre 1 y 100");
}

export const reviewValidator = [
    contentValidator,
    body("rating")
        .isObject().withMessage("El campo rating debe ser un objecto"),
    ratingValidator("rating.overall"),
    ratingValidator("rating.story"),
    ratingValidator("rating.gameplay"),
    ratingValidator("rating.technicalSection"),
    ratingValidator("rating.art"),
    ratingValidator("rating.sound")
]