import { apiErrors } from "../utils/apiErrors.js";

export const requireAdminStatus = async (req, res, next) => {
    try {
        if(req.roles.includes("administrator")) {
            next();
        }else {
            throw apiErrors.unauthorized
        }
    } catch (error) {
        next(error)
    }
}

export const requireModeratorStatus = async (req, res, next) => {
    try {
        if(req.roles.includes("moderator")){
            next()
        }else {
            throw apiErrors.unauthorized
        }
    } catch (error) {
        next(error)
    }
}