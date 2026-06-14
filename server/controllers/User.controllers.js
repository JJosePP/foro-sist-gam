import userService from "../services/User.service.js";
import userModel from "../models/User.model.js";
import fs from 'fs-extra'
import authenticationService from "../services/Authentication.service.js";
import { apiErrors } from "../utils/apiErrors.js";


const getUser = async (req, res, next) => {
    try {
        const userId = req.params.userId
        let user = await userService.getUser(userId, req.uid)
        return res.json({ user });
    } catch (error) {
        next(error)
    }
}

const editProfile = async (req, res, next) => {
    try{
        const userId = req.params.userId
        let result = await userService.editProfile(userId,req.uid,req.body, req.files[0]);

        return res.status(200).json({result})
    } catch(error){
        next(error)
    }
}

const banUser = async (req,res,next) => {
    try {
        const userId = req.params.userId
        const banDate = req.body.bannedUntil

        if(Date.parse(banDate) < Date.now()){
            throw apiErrors.expiredDate
        }

        let result = await userService.banUser(userId, banDate)
        return res.status(200).json({
            message: `Usuario ${result.userName} vetado con éxito`,
            bannedUser: result
        })
    } catch (error) {
        next(error)
    }
}

const unBanUser = async (req,res,next) => {
    try {
        const userId = req.params.userId
        
        let result = await userService.unBanUser(userId)
        return res.status(200).json({
            message: `Prohibición de ${result.userName} levantada con éxito`,
            unbannedUser: result    
        })
    } catch (error) {
        next(error)
    }
}

const deleteUser = async (req,res,next) => {
    try {
        const userId = req.params.userId;

        await userService.deleteUser(userId, req.uid)
        res.clearCookie("refreshToken");
        await authenticationService.logout(req.tokenId)
        return res.status(200).json({message: "Usuario marcado para eliminar. Inicia sesión de nuevo si quiere cancelar la eliminación"})
    } catch (error) {
        next(error)
    }
}

const changePassword = async (req,res,next) => {
    try {
        const userId = req.params.userId;

        await userService.changePassword(userId,req.uid, req.body.password);
        res.clearCookie("refreshToken");
        await authenticationService.logout(req.tokenId)

        return res.status(200).json({message: "Contraseña cambiada con éxito. Vuelva a iniciar sesión"})
    } catch (error) {
        next(error)
    }
}

const getCompletedQuizzes = async (req,res,next) => {
    try {
        let completedQuizzes = await userService.getCompletedQuizzes(req.uid)
        return res.status(200).json({completedQuizzes})
    } catch (error) {
        next(error)
    }
}

const getUsers = async (req,res,next) => {
    try {
        let users = await userService.getUsers();
        return res.status(200).json({users})
    } catch (error) {
        next(error)
    }
}
export default {
    getUser,
    editProfile,
    banUser,
    unBanUser,
    deleteUser,
    changePassword,
    getCompletedQuizzes,
    getUsers
}
