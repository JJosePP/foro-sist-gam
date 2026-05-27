
export const errorHandler = (err, req, res, next) => {
    console.log(err)
    if(err.validation){
        return res.status(err.status).json({
            status: err.status,
            title: err.title,
            details: err.details,
            validation: err.validation
        });
    }
    if(err.name === "ValidationError"){
        return res.status(400).json({
            status: 400,
            title: "Error de validación",
            details: "Algunos campos no cumplen las reglas de validación",
            validation: Object.values(err.errors).map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    };

    if(err.name === "CastError" && err.kind === "ObjectId" || err.name === "BSONError"){
        return res.status(400).json({
            status: 400,
            title: "Identificador no válido",
            details: "El identificador proporcionado no tiene un formato válido (cadena hexadecimal de 24 caracteres)"
        });
    };

    const status = err.status || 500

    return res.status(status).json({
        status,
        title: err.title || "Error interno del servidor",
        details: err.details || "Ha ocurrido un error inesperado. Inténtelo de nuevo más tarde."
    });
};