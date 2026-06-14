import { query, body, param } from "express-validator";
import { nameValidator } from "./commonValidators.js";

export const searchValidator = [
    query("search")
        .trim()
        .notEmpty().withMessage("El término a buscar es obligatorio")
        .isLength({max:30}).withMessage("El límite es de 30 caracteres")
]

export const gameValidator = [
    nameValidator("name",2,60),
    body("developmentCompany")
        .isString().withMessage('La empresa desarrolladora debe ser texto')
        .trim()
        .notEmpty().withMessage('La empresa desarrolladora es requerida')
        .isLength({min:2,max:50}).withMessage('La empresa desarrolladora debe tener entre 2 y 50 caracteres'),
    body("releaseDate")
        .isString().withMessage('La fecha debe ser texto')
        .trim()
        .notEmpty().withMessage('La fecha es requerida')
        .isISO8601({strict:true,strictSeparator:true}).withMessage('La fecha debe tener formato ISO 8601 válido')
        .toDate().custom(value => !isNaN(value.getTime())).withMessage("Introduzca una fecha válida"),
    body("description")
        .isString().withMessage("La descripción debe ser texto")
        .trim()
        .notEmpty().withMessage('La descripcion es requerida')
        .isLength({max:1000}).withMessage('La descripción debe tener 1000 caracteres como máximo'),       
    body("platforms").isArray({min:1}).withMessage("Debe introducir una lista de plataformas"),
    body("platforms.*").isString().withMessage("El elemento del array debe ser un identificador en formato texto")
        .trim()
        .notEmpty().withMessage("El elemento del array no puede ser vacío")
        .isMongoId().withMessage("El identificador proporcionado no tiene un formato válido (cadena hexadecimal de 24 caracteres)"),
    body("genres").isArray({min:1}).withMessage("Debe introducir una lista de géneros"),
    body("genres.*").isString().withMessage("El elemento del array debe ser un identificador en formato texto")
        .trim()
        .notEmpty().withMessage("El elemento del array no puede ser vacío")
        .isMongoId().withMessage("El identificador proporcionado no tiene un formato válido (cadena hexadecimal de 24 caracteres)"),
]

export const imageIdValidator = [
    param("imageId")
        .trim()
        .notEmpty()
        .withMessage("El identificador de la imagen es obligatorio")
]