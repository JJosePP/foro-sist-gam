import invalidToken from "../models/invalidTokens.model.js"
import { apiErrors } from "../utils/apiErrors.js";

export const tokenIsInvalid = async (req,res,next) => {
    try {
        let token = await invalidToken.exists({tokenId: req.tokenId});
        if(token){
            throw apiErrors.invalidToken
        }
        next()

    } catch (error) {
        next(error)
    }
}