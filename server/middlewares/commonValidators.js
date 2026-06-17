import { param, body } from "express-validator";
import { apiErrors } from "../utils/apiErrors.js";

const idTypes = {
    platformId: "plataforma",
    categoryId: "categoría",
    threadId: "hilo",
    replyId: "respuesta",
    genreId: "género",
    gameId: "juego",
    userId: "usuario",
    badgeId: "emblema",
    tagId: "etiqueta",
    questionId: "pregunta",
    quizId: "prueba",
    sessionId: "sesión",
    postId: "publicación"
};

export const idValidator = (id) => {
    return [
        param(id)
            .trim()
            .notEmpty()
            .withMessage(`El identificador de ${idTypes[id]} es obligatorio`)
            .isMongoId()
            .withMessage(
                "El identificador proporcionado no tiene un formato válido (cadena hexadecimal de 24 caracteres)",
            ),
    ];
};

const nameTypes = {
    name: "nombre",
    userName: "nombre de usuario",
    lastName: "apellido"
};

export const nameValidator = (name, minChar, maxChar) => {
    let chain = body(name)
        .isString()
        .withMessage(`El ${nameTypes[name]} debe ser texto`)
        .bail()
        .trim()
        .notEmpty()
        .withMessage(`El ${nameTypes[name]} es requerido`)
        .bail()
        .isLength({ min: minChar, max: maxChar })
        .withMessage(`El ${nameTypes[name]} debe tener entre ${minChar} y ${maxChar} caracteres`);

    return chain
};

export const titleValidator = 
    body("title")
        .isString().withMessage("El título debe ser texto")
        .bail()
        .trim()
        .notEmpty().withMessage("El título es requerido")
        .bail()
        .isLength({min: 5, max: 50}).withMessage("El título debe tener entre 5 y 50 caracteres");

export const contentValidator = body("content")
        .notEmpty().withMessage("El contenido es requerido")
        .bail()
        .isString().withMessage("El contenido debe ser texto")
        .bail()
        .trim()
        .isLength({max: 8000}).withMessage("El tamaño máximo del contenido es de 8000 caracteres");

const validateMainImage = (req,required) => {
    if(req.files?.mainImage?.length > 1){
        throw apiErrors.tooManyMainImages
    }

    if(required){
        if(!req.files?.mainImage){
            throw apiErrors.requiredMainImage
        }

        if(!req.files.mainImage[0].mimetype.startsWith("image/")){
            throw apiErrors.invalidFileType
        } 
    }else{
        if(req.files?.mainImage && !req.files.mainImage[0].mimetype.startsWith("image/")){
            throw apiErrors.invalidFileType
        }
    }
}

export const mainImageValidator = (required) => {
    return (req,res,next) => {
        try {
            validateMainImage(req,required);
            next()
        } catch (error) {
            next(error)
        }
    }
}
export const validateOptionalScreenshots = (req,res,next) => {
    const screenshots = req.files.screenshots || []
    if(screenshots.length > 10){
        return next(apiErrors.tooManyScreenshots)
    }

    for(const screenshot of screenshots){
        if(!screenshot.mimetype.startsWith("image/")){
            return next(apiErrors.invalidFileType)
        }
    }

    next()
}

const validateImage = (req,required) => {
    const files = req.files || []
    if(req.files?.length > 1){
        throw apiErrors.tooManyImages
    }

    if(required){
        if(!req.files[0]){
            throw apiErrors.requiredImage
        }
        if(!req.files[0].mimetype.startsWith("image/")){
            throw apiErrors.invalidFileType
        } 
    }else{
        if(req.files[0]  && !req.files[0]?.mimetype.startsWith("image/")){
            throw apiErrors.invalidFileType
        }
    }
}

export const imageValidator = (required) => {
    return (req,res,next) => {
        try {
            validateImage(req,required);
            next()
        } catch (error) {
            next(error)
        }
    }
}