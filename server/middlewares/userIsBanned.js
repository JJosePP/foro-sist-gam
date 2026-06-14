import userModel from "../models/User.model.js";
import authenticationService from "../services/Authentication.service.js"
import { apiErrors } from "../utils/apiErrors.js";

export const userIsBanned = async (req,res,next) => {
    try {
        let user = await userModel.findById(req.uid);

        if(user?.authorized === false){
            res.clearCookie("refreshToken")
            let banDate = user.bannedUntil.toLocaleString(undefined,
                {year:"numeric",month:"long", day:"numeric",hour: 'numeric',minute:'numeric' })
            await authenticationService.logout(req.tokenId)
            let bannedUser = {...apiErrors.bannedUser}
            bannedUser.details = bannedUser.details.concat(" ", banDate)
            throw bannedUser
        }

        next()
    } catch (error) {
        next(error)
    }
}