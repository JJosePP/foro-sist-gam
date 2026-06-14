import { body } from "express-validator";
import { nameValidator } from "./commonValidators.js";

export const categoryValidator = [
    nameValidator("name",2,30),
    body("description")
        .isString().withMessage("La descripción debe ser texto")
        .bail()
        .trim()
        .notEmpty().withMessage('La descripcion es requerida')
        .bail()
        .isLength({max:200}).withMessage('La descripción debe tener 200 caracteres como máximo')
]