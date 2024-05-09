import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt"

const uniqueAttribute = async function (attr, value){
    const user = await this.constructor.findOne({[attr]:value})
    if(user){
        if(this.id === user.id){
            return true
        }
        return false
    }
    return true
}

let manyValidators = [
    {validator: validator.isEmail, message:'Correo electrónico no válido'},
    {validator: async function(value){
        return await uniqueAttribute.call(this,'email', value)
    }, message: props => 'Correo electrónico ya en uso'}
]

const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: true,
        unique: true,
        minLength: [2, 'Nombre de usuario no válido, la longitud debe ser al menos 2'],
        maxLength:[20, 'Nombre de usuario no válido, la longitud debe ser menor que 20'],
        validate:{
            validator: async function(value){
                return await uniqueAttribute.call(this,'userName', value)
            },
            message: props => "El nombre de usuario ya existe"
        }
        //lowercase: true
    },
    name:{
        type: String,
        required: true,
        minLength: [2, 'Nombre no válido, la longitud mínima es 2 caracteres'],
        maxLength: [20, 'Nombre no válido, la longitud máxima es 20 caracteres']
    },
    lastName:{
        type: String,
        required: true,
        minLength: [2,'Campo apellidos no válido, la longitud mínima es 2 caracteres'],
        maxLength: [30, 'Campo apellidos no válido, la longitud máxima es 30 caracteres']
    },
    email:{
        type: String,
        required: [true,"Debe insertar un correo electrónico"],
        unique: true,
        validate: manyValidators
    },
    password:{
        type: String,
        required: true,
        validate: [validator.isStrongPassword, 'Contraseña no válida'] //pensar donde poner los requisitos: min 8 caracteres, 1 minuscula,1 mayuscula,1 numero, 1 simbolo
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
    badges:[{
        type: mongoose.Types.ObjectId,
        ref: 'Badge'
    }]
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