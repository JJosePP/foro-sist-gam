import { ExpressValidator} from 'express-validator';

const {validationResult} = new ExpressValidator({}, {}, {
    errorFormatter: error => ({
        field: error.path,
        message: error.msg
  })
});

export const validateRequest = (req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next({
            status: 400,
            title: "Datos de entrada no válidos",
            details: "Uno o más campos de entrada no cumplen las reglas de validación",
            validation: errors.array()
        })
    }

    next()
}