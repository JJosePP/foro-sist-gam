import userModel from "../models/User.model.js";
import invalidTokenModel from "../models/invalidTokens.model.js";
import { uploadImage } from "../utils/cloudinary.js";
import fs from 'fs-extra';
import "dotenv/config";
import { apiErrors } from "../utils/apiErrors.js";
import badgeService from "./Badge.service.js";
const register = async (body, file) => {
    let normalizedUserName = body.userName.toLowerCase()
    const existingUsers = await userModel.find({
        $or: [
        { normalizedUserName: normalizedUserName},
        { email: body.email}
        ]
    })

    if (existingUsers.length === 1){
        let error = new Error();
        error.name = "ValidationError"
        error.errors = {}
        if(existingUsers[0].userName.toLowerCase() === body.userName.toLowerCase()){
            error.errors.userName = {message: "El nombre de usuario ya está en uso"}
        }
        if(existingUsers[0].email.toLowerCase() === body.email.toLowerCase()){
            error.errors.email = {message: "El correo electrónico ya está registrado"}
        }
        throw error

    }else if(existingUsers.length === 2){
        let error =  new Error()
        error.name  = "ValidationError"
        error.errors = {
            userName: {message: "El nombre de usuario ya está en uso"},
            email: {message: "El correo electrónico ya está registrado"}
        }
        throw error
    }

    const userData = {
        userName: body.userName,
        name: body.name,
        lastName: body.lastName,
        email: body.email,
        description: body.description,
        password: body.password,
        roles: ["user"],
        normalizedUserName: normalizedUserName
    }
    const user = new userModel(userData)
    await user.validate();

    if(file){
        const result = await uploadImage(file.path, 'profile', null, 'profile')
        user.profilePic = {
            public_id: result.public_id,
            secure_url: result.secure_url
        }
        await fs.unlink(file.path)
    }else {
        user.profilePic = {
            public_id: process.env.DEFAULT_PIC_ID,
            secure_url: process.env.DEFAULT_PIC_URL
        }
    } 
    
    const savedUser = await user.save()
    return savedUser;
};

const login = async (body) => {
    console.log('Iniciando proceso')
    const { userName, password } = body;

    let user = await userModel.findOne({ normalizedUserName: userName.toLowerCase()});

    if (!user) {
        throw apiErrors.userNotFound
    }

    if(user.authorized === false){
        if(Date.now() < Date.parse(user.bannedUntil)){
            let banDate = user.bannedUntil.toLocaleString(undefined,{year:"numeric",month:"long", day:"numeric",hour: 'numeric',minute:'numeric' })
            let bannedUser = {...apiErrors.bannedUser}
            bannedUser.details = bannedUser.details.concat(" ", banDate)
            throw bannedUser
        }else{
            user.authorized = true;
            user.bannedUntil = null;
            await user.save()
        }
    }
    
    if(user.deleteOn !== null){
        user.deleteOn = null;
        await badgeService.insertUserToBadges(user.badges, user._id);
        await user.save();
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw apiErrors.wrongPassword
    }

    return user;
};

const logout = async (tokenId) => {
    let expirationDate = new Date(Date.now() + 15*60*1000);

    let token = new invalidTokenModel({
        tokenId: tokenId,
        expireAt: expirationDate
    })
    await token.validate();

    return await token.save()
}

const refreshToken = async (uid) => {
    let user = await userModel.findById(uid)

    if(user.authorized === false) {
        res.clearCookie("refreshToken");
        let banDate = user.bannedUntil.toLocaleString(undefined,{year:"numeric",month:"long", day:"numeric",hour: 'numeric',minute:'numeric' })
        let bannedUser = {...apiErrors.bannedUser}
        bannedUser.details = bannedUser.details.concat(" ", banDate)
        throw bannedUser
    }
}

export default { register, login, logout, refreshToken };
