import { body } from "express-validator";
import { nameValidator } from "./commonValidators.js";
import { apiErrors } from "../utils/apiErrors.js";



export const userValidator = [
    nameValidator("userName",2,20),
    nameValidator("name",2,20),
    nameValidator("lastName",2,30),
    body("email")
        .notEmpty().withMessage("El correo electrónico es requerido")
        .bail()
        .isString().withMessage("El correo electrónico debe ser texto")
        .bail()
        .trim()
        .toLowerCase()
        .isEmail().withMessage("El correo electrónico proporcionado no tiene formato válido"),
    body("description")
        .optional()
        .isString().withMessage("La descripción debe ser texto")
        .bail()
        .trim()
        .isLength({max:500}).withMessage("La descripción tiene 500 caracteres como máximo")
]

export const banDateValidator = [
    body("bannedUntil") 
        .notEmpty().withMessage('La fecha es requerida')
        .bail()
        .isString().withMessage('La fecha debe ser texto')
        .trim()
        .isISO8601({strict:true, strictSeparator:true}).withMessage('La fecha debe tener formato ISO 8601 válido')
        .toDate().custom(value => !Number.isNaN(value.getTime())).withMessage("Introduzca una fecha válida")
]

export const passwordValidator = [
    body("password")
        .notEmpty().withMessage('La contraseña es requerida')
        .bail()
        .isString().withMessage('La contraseña debe ser texto')
        .bail()
        .trim()
        .isStrongPassword().withMessage('Contraseña débil. Requisitos mínimos: 8 caracteres, 1 minúscula, 1 mayúscula,1 número, 1 símbolo especial'),
    body("confirmPassword")
        .notEmpty().withMessage('Debe confirmar la nueva contraseña')
        .bail()
        .isString().withMessage('La contraseña debe ser texto')
        .bail()
        .trim()
        .custom((value,{req}) => value === req.body.password).withMessage("Las contraseñas no coinciden")
]

export const loginValidator = [
    body("userName")
    .notEmpty().withMessage("Introduzca el nombre de usuario")
    .bail()
    .isString().withMessage("El nombre de usuariod debe ser texto"),
    body("password")
    .notEmpty().withMessage("Introduzca la contraseña")
    .bail()
    .isString().withMessage("La contraseña debe ser texto")
]
