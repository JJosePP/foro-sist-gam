import { tokenVerificationErrors } from "../utils/tokenManager.js";
import jwt from "jsonwebtoken";

export const requireRefreshToken = (req, res, next) => {
    try {
        const refreshTokenCookie = req.cookies.refreshToken

        const payload = jwt.verify(refreshTokenCookie, process.env.JWT_REFRESH);
        req.uid = payload.uid

        next()
    } catch (error) {
        return next({
            status: 401,
            title: "No autorizado",
            details: "El token no es válido o ha expirado",
            err: tokenVerificationErrors[error.message]
        })
    }
}