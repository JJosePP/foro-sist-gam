

export const apiErrors = {
    userNotFound: {
        status: 404,
        title: "Usuario no encontrado",
        details: "El usuario solicitado no existe o ha sido eliminado."
    },
    unauthorized: {
        status: 403,
        title: "Acceso denegado",
        details: "No tiene permisos para realizar esta operación."
    },
    gameNotFound: {
        status: 404,
        title: "Juego no encontrado",
        details: "El juego solicitado no existe o ha sido eliminado."
    },
    uploadError: {
        status: 400
    },
    threadNotFound: {
        status: 404,
        title: "Hilo no encontrado",
        details: "El hilo solicitado no existe o ha sido eliminado."
    },
    replyNotFound: {
        status: 404,
        title: "Comentario no encontrado",
        details: "El comentario solicitado no existe o ha sido eliminado."
    },
    moderatedContent: {
        status: 409,
        title: "Publicación moderada",
        details: "Esta publicación ha sido moderada y no puede modificarse."
    },
    closedThread: {
        status: 409,
        title: "Hilo cerrado",
        details: "Este hilo está cerrado y no permite nuevas respuestas ni modificaciones."
    },
    missingCategoryQuery: {
        status: 400,
        title: "Categoría no especificada",
        details: "Debe indicar el identificador de una categoría mediante el parámetro de consulta 'category'."
    },
    categoryNotFound: {
        status: 404,
        title: "Categoría no encontrada",
        details: "La categoría especificada no existe o ha sido eliminada."
    },
    existingPlatform: {
        status: 400,
        title: "Plataforma ya existente",
        details: "Ya existe una plataforma con el nombre o el nombre para mostrar proporcionados."
    },
    platformNotFound: {
        status: 404,
        title: "Plataforma no encontrada",
        details: "La plataforma especificada no existe o ha sido eliminada."
    },
    invalidToken: {
        status: 401,
        title: "Token no válido",
        details: "El token de acceso no es válido. Auntentíquese de nuevo"
    },
    existingCategory: {
        status: 400,
        title: "Categoría ya existente",
        details: "Ya existe una categoría con el nombre o el nombre para mostrar proporcionados."
    },
    existingGenre: {
        status: 400,
        title: "Género ya existente",
        details: "Ya existe un género con el nombre o el nombre para mostrar proporcionados."
    },
    genreNotFound: {
        status: 404,
        title: "Género no encontrado",
        details: "El género especificado no existe o ha sido eliminado."
    },
    tooManyScreenshots: {
        status: 400,
        title: "Demasiados archivos",
        details: "No se pueden subir más de 10 capturas"
    },
    invalidFileType: {
        status: 400,
        title: "Tipo de archivo no válido",
        details: "Solo se permiten archivos de tipo imagen",
    },
    existingGame: {
        status: 400,
        title: "Juego ya existente",
        details: "Ya existe un juego con el nombre proporcionado."
    },
    tooManyMainImages: {
        status: 400,
        title: "Demasiados archivos",
        details: "No se pueden subir más de 1 imagen principal"
    },
    requiredMainImage: {
        status: 400,
        title: "Archivo requerido",
        details: "Debe subir una imagen principal para el juego"
    },
    uploadError: {
        status: 400,
        title: null,
        details: null
    },
    wrongImageId: {
        status: 400,
        title: "Imagen no válida",
        details: "La imagen seleccionada no se encuentra entre las capturas del juego"
    },
    expiredDate: {
        status: 400,
        title: "Fecha no válida",
        details: "Introduzca una fecha posterior a la actual"
    },
    alreadyBanned: {
        status: 400,
        title: "Usuario con prohibición",
        details: "El usuario ya tiene prohibido el acceso"
    },
    notBanned: {
        status: 400,
        title: "Usuario sin prohibición",
        details: "El usuario no tiene prohibido el acceso"
    },
    samePassword: {
        status: 400,
        title: "Contraseña idéntica",
        details: "Ha introducido la misma contraseña que tenía anteriormente. Elija una diferente"
    },
    tooManyImages: {
        status: 400,
        title: "Demasiados archivos",
        details: "No se puede subir más de una imagen"
    },
    bannedUser: {
        status: 403,
        title: "Usuario vetado",
        details: "Ha sido vetado de la plataforma hasta la siguiente fecha:"
    },
    wrongPassword: {
        status: 401,
        title: "Contraseña incorrecta",
        details: "La contraseña que ha introducido no es correcta"
    },
    existingTag: {
        status: 400,
        title: "Etiqueta ya existente",
        details: "Ya existe una etiqueta con el nombre o el nombre para mostrar proporcionados."
    },
    tagNotFound: {
        status: 404,
        title: "Etiqueta no encontrada",
        details: "La etiqueta especificada no existe o ha sido eliminada."
    },
    existingReview: {
        status: 400,
        title: "Reseña ya existente",
        details: "Ya reseñaste este juego"
    },
    reviewNotFound: {
        status: 404,
        title: "Reseña no encontrada",
        details: "La reseña especificada no existe o ha sido eliminada."
    },
    questionNotFound: {
        status: 404,
        title: "Pregunta no encontrada",
        details: "La pregunta solicitada no existe o ha sido eliminada."
    },
    existingBadge: {
        status: 400,
        title: "Emblema ya existente",
        details: "Ya existe un emblema con el nombre proporcionado"
    },
    requiredImage: {
        status: 400,
        title: "Archivo requerido",
        details: "Debe subir una imagen para el emblema"
    },
    badgeNotFound: {
        status: 404,
        title: "Emblema no encontrado",
        details: "El emblema solicitado no existe o ha sido eliminado."
    },
    deletingBadge: {
        status: 400,
        title: "Eliminación no permitida",
        details: "No es posible eliminar el emblema porque ya está asociado a una prueba"
    },
    quizNotFound: {
        status: 404,
        title: "Prueba no encontrada",
        details: "La prueba solicitada no existe o ha sido eliminada."
    },
    badgeInUse: {
        status: 400,
        title: "Emblema en uso",
        details: "El emblema especificado ya pertenece a una prueba existente."
    },
    activeSession: {
        status: 400,
        title: "Sesión activa",
        details: "Ya tienes una sesión activa en este momento."
    },
    sessionNotFound: {
        status: 400,
        title: "Sesión no encontrada",
        details: "La sesión solicitada no existe o ha expirado."
    },
    finishedSession: {
        status: 400,
        title: "Sesión finalizada",
        details: "La sesión solicitada ya ha sido finalizada."
    },
    expiredSession: {
        status: 400,
        title: "Tiempo agotado",
        details: "La sesión solicitada ha finalizado por tiempo."
    },
    postNotFound: {
        status: 404,
        title: "Publicación no encontrada",
        details: "La publicación solicitada no existe o ha sido eliminada."
    },
    alreadyModerated: {
        status: 400,
        title: "Publicación moderada",
        details: "La publicación ya ha sido moderada y no puede volver a ser reportada."
    },
    reportNotFound: {
        status: 404,
        title: "Reporte no encontrado",
        details: "El reporte solicitado no existe o ha sido eliminado."
    }
    // existingUserName: {
    //     status: 400,
    //     title: "Nombre de usuario ya existente",
    //     details: "El nombre de usuario proporcionado ya está en uso"
    // },
    // existingEmail: {
    //     status: 400,
    //     title: "Correo electrónico ya existente",
    //     details: "El correo electrónico proporcionado ya está en uso"
    // }
}