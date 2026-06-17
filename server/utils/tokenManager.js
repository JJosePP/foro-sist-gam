import jwt from "jsonwebtoken";
import {v4 as uuidv4} from 'uuid';

export const generateToken = (uid, roles) => {
    const expiresIn = 60 * 15;
    try {
        const tokenId = uuidv4()
        const token = jwt.sign({ tokenId, uid, roles }, process.env.JWT_SECRET, {
            expiresIn: expiresIn,
        });
        return { token, expiresIn };
    } catch (error) {
        console.log(error);
    }
};

export const createRefreshToken = (uid) => {
    const expiresIn = 60 * 60 * 24 * 30;

    return jwt.sign({ uid }, process.env.JWT_REFRESH, {
            expiresIn,
        });
}

export const generateRefreshToken = (uid, res) => {
    const expiresIn = 60 * 60 * 24 * 30;
    try {
        // const refreshToken = jwt.sign({ uid }, process.env.JWT_REFRESH, {
        //     expiresIn,
        // });
        const refreshToken = createRefreshToken(uid)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: !(process.env.MODO === "developer"),
            expires: new Date(Date.now() + expiresIn * 1000)
        });
    } catch (error) {
        console.log(error);
    }
};

export const tokenVerificationErrors = {
    "invalid signature": "La firma del JWT no es válidad",
    "jwt expired": "JWT expirado",
    "invalid token": "Token no válido",
    "jwt malformed": "JWT formato no válido",
    "No token": "No existe el token",
    "jwt must be provided": "Introduzca un token"
}
