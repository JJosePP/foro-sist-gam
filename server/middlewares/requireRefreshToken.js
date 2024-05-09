import { tokenVerificationErrors } from "../utils/tokenManager.js";
import jwt from "jsonwebtoken";

export const requireRefreshToken = (req, res, next) => {
    try {
        const refreshTokenCookie = req.cookies.refreshToken
        if(!refreshTokenCookie) {
            throw new Error("No token")
        }
        const payload = jwt.verify(refreshTokenCookie, process.env.JWT_REFRESH);
        req.uid = payload.uid

        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({error: tokenVerificationErrors[error.message]})
    }
}