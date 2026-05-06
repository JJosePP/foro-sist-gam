import mongoose from "mongoose";

function possitiveNumber (val) {
    return val >= 0;
}

const numberValidators = [
    {validator: possitiveNumber, message: 'Debe ser un número positivo'},
    {validator: Number.isInteger, message: 'Debe ser un número entero'}
]
const rt = {
    type: Number,
    default: 0,
    validate: numberValidators
};

const gameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del juego es requerido'],
    },
    normalizedName: {
        type: String,
        unique: true
    },
    platforms: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: "Platform"
        }],
        required:[true, 'La lista de plataformas es requerida'],
        validate: [array => array.length > 0, 'Debe tener al menos una plataforma'],
        index: true
    },
    developmentCompany: {
        type: String,
        required: [true, 'La compañia desarrolladora es requerida'],
    },
    releaseDate: {
        type: Date,
        required: [true, 'La fecha de publicación es requerida'],
    },
    description: {
        type: String,
        required: [true, 'La descripción del juego es requerida'],
        maxLength: [1000, "La longitud máxima permitida es 1000 caracteres"],
    },
    screenshots: {
        type: [{
            public_id: {type: String},
            secure_url: {type: String}
        }]
    },
    genres: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: "Genre"
        }],
        required:[true, 'La lista de géneros es requerida'],
        validate: [array => array.length > 0, 'Debe tener al menos un género'],
        index: true
    },
    rating: {
        overall: rt,
        story: rt,
        gameplay: rt,
        technicalSection: rt,
        art: rt,
        sound: rt,
    },
    numReviews:{
        type: Number,
        validate: numberValidators,
        default: 0
    },
    mainImage: {
        public_id: {
            type: String,
            required: [true, 'La imagen principal (public_id) es requerida']
        },
        secure_url: {
            type: String,
            required: [true, 'La imagen principal (secure_url) es requerida']
        }
    }
}, {
    timestamps: true
});
//PUUEDE QUE TENGA QUE DUPLICAR TODOS ESTOS INDICES Y PONER -1 AL CAMPO DEL MEDIO
gameSchema.index({genres: 1,name: 1, _id: 1})
gameSchema.index({genres: 1,createdAt: 1, _id: 1})
gameSchema.index({genres: 1,"rating.overall": 1, _id: 1})
gameSchema.index({genres: 1,releaseDate: 1, _id: 1})

gameSchema.index({platforms: 1,name: 1, _id: 1})
gameSchema.index({platforms: 1,createdAt: 1, _id: 1})
gameSchema.index({platforms: 1,"rating.overall": 1, _id: 1})
gameSchema.index({platforms: 1,releaseDate: 1, _id: 1})
const Game = mongoose.model("Game", gameSchema);

export default Game;
