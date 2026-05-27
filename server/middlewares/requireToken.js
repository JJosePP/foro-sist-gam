import jwt from "jsonwebtoken";
import { tokenVerificationErrors } from "../utils/tokenManager.js";

export const requireToken = (req, res, next) => {
    try {
        let token = req.headers?.authorization;

        token = token?.split(" ")[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        console.log('token')
        console.log(token)
        console.log("payload")
        console.log(payload)
        req.uid = payload.uid;
        req.tokenId = payload.tokenId
        req.roles = payload.roles
        
        next();
    } catch (error) {
        return next({
            status: 401,
            title: "No autorizado",
            details: "El token no es válido o ha expirado",
            err: tokenVerificationErrors[error.message]
        })
    }
};
