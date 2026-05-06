import { body, param, query } from "express-validator";
import { titleValidator, contentValidator } from "./commonValidators.js";

export const threadStatusValidator =
    body("status")
        .isString().withMessage("El estado debe ser texto")
        .trim()
        .notEmpty().withMessage("El estado es requerido")
        .isIn(["Abierto", "Cerrado"]).withMessage("Los únicos valores permitidos son: Abierto o Cerrado");

export const partialBodyThreadValidator = [
    titleValidator,
    contentValidator
]

export const completeBodyThreadValidator = [
    ...partialBodyThreadValidator,
    body("category")
        .isString().withMessage("La categoría debe ser un identificador en formato texto")
        .trim()
        .notEmpty().withMessage("La categoría es requerida")
        .isMongoId().withMessage("El identificador proporcionado no tiene un formato válido (cadena hexadecimal de 24 caracteres)")
];

export const threadCategoryValidator = [
    query("category")
        .trim()
        .notEmpty().withMessage("El identificador de la categoría es obligatorio")
        .isMongoId().withMessage("El identificador proporcionado no tiene un formato válido (cadena hexadecimal de 24 caracteres)")
]