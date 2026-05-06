import mongoose from "mongoose";

const regex_to_remove_white_spaces = /\s* \s*/g;
const regex_to_remove_special_chars = /[^a-zA-Z0-9\s]/g;


export const normalizeName = (str) => {
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replaceAll(regex_to_remove_special_chars,' ')
        .replaceAll(regex_to_remove_white_spaces,'-').toLowerCase();
}


export const basedSchema = new mongoose.Schema({
    name: {
        type: String,
        required:[true, 'El nombre del género para mostrar es requerido'],
        minLength: [2, 'La longitud máxima es 2 caracteres'],
        maxLength: [30, 'La longitud máxima es 30 caracteres'],
    },
    normalizedName: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

basedSchema.index({name:1, _id:1});

