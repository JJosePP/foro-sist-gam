import authenticationService from "../services/Authentication.service.js"
import { generateRefreshToken, generateToken } from "../utils/tokenManager.js";
import userModel from "../models/User.model.js";

const register = async (req, res, next) => {

    try {
        const user = await authenticationService.register(req.body, req.files[0]);
        const {token, expiresIn} = generateToken(user.id, user.roles);
        generateRefreshToken(user.id, res);

        return res.status(201).json({message:"Usuario registrado correctamente", token, expiresIn});
    } catch (error) {
        next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const user = await authenticationService.login(req.body);
        const username = user.userName
        const profilePic = user.profilePic.secure_url
        const userId = user.id
        //Generar token JWT
        const { token, expiresIn } = generateToken(user.id, user.roles);
        generateRefreshToken(user.id, res);

        return res.status(200).json({ message:"Sesión iniciada correctamente",userId, username, profilePic, token, expiresIn });
    } catch (error) {
        next(error)
    }
}


const refreshToken = async (req, res, next) => {
        try {
            let user = await authenticationService.refreshToken(req.uid)
            const { token, expiresIn } = generateToken(req.uid, user.roles);

            return res.json({ token, expiresIn });
        } catch (error) {
            next(error)
        }
};

const logout = async (req, res, next) => {
    try {
        console.log("LLEGA")
        res.clearCookie("refreshToken");
        console.log(req.tokenId)
        const token = await authenticationService.logout(req.tokenId)

        return res.status(201).json({token, message: "Sesión cerrada correctamente" });
        
    } catch (error) {
        console.log(error)
        next(error)
    }
};

export default {
    register,
    login,
    refreshToken,
    logout
};