import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: [true, 'El nombre de usuario es requerido'],
        minLength: [2, 'Nombre de usuario no válido, la longitud debe ser al menos 2'],
        maxLength:[20, 'Nombre de usuario no válido, la longitud debe ser menor que 20'],
    },
    normalizedUserName: {
        type: String,
        unique: true,
    },
    name:{
        type: String,
        required: [true, 'El nombre es requerido'],
        minLength: [2, 'Nombre no válido, la longitud mínima es 2 caracteres'],
        maxLength: [20, 'Nombre no válido, la longitud máxima es 20 caracteres']
    },
    lastName:{
        type: String,
        required: [true, 'Los apellidos son requeridos'],
        minLength: [2,'Campo apellidos no válido, la longitud mínima es 2 caracteres'],
        maxLength: [30, 'Campo apellidos no válido, la longitud máxima es 30 caracteres']
    },
    email:{
        type: String,
        required: [true,'El correo electrónico es requerido'],
        unique: true,
        validate: [validator.isEmail, 'Correo electrónico no válido']
    },
    password:{
        type: String,
        required: [true,'La contraseña es requerida'],
        validate: [validator.isStrongPassword, 'Contraseña no válida']
    },
    profilePic:{
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    roles: {
        type: [{
            type: String,
            lowercase: true,
            enum: {
                values: ["user","moderator","administrator"],
                message: '{VALUE} no es correcto'
            }
        }],
        default: ["user"]
    },
    description:{
        type: String,
        maxLength:500
    },
    authorized:{
        type: Boolean,
        required: true,
        default: true
    },
    bannedUntil:{
        type: Date,
        default: null
    },
    deleteOn:{
        type: Date,
        default: null, 
        expires: 0
    },
    // badges:{
    //     type: [{
    //         type: mongoose.Types.ObjectId,
    //         ref: 'Badge'
    //     }],
    //     default: []
    // },
    completedQuizzes: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: 'Quiz'
        }],
        default: []
    }
}, {
    timestamps: true
})

userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password,salt);
    }
    next();
})

userSchema.methods.comparePassword = async function(password){
    const isMatch = await bcrypt.compare(password, this.password)
    return isMatch
}

const User = mongoose.model('User', userSchema)

export default User;