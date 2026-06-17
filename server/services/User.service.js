import userModel from "../models/User.model.js";
import {deleteImage, uploadImage} from "../utils/cloudinary.js"
import fs from 'fs-extra'
import { apiErrors } from "../utils/apiErrors.js";

const getUser = async (userId, uid) => {
    let user;
    if(userId === uid){
        user = await userModel.findById(userId)
            .select("-password -normalizedName -authorized -bannedUntil -deleteOn")
            // .populate({path: "badges", select: "name image quiz"})
            .populate({path: "completedQuizzes", select: "_id title badge.name badge.image.secure_url"})
    }else{
        user = await userModel.findById(userId)
            .select("_id userName profilePic.secure_url description roles createdAt")
            // .populate({ path: "badges", select: "name image.secure_url quiz" })
            .populate({path: "completedQuizzes", select: "_id title badge.name badge.image.secure_url"})

    }
    if(!user){
        throw apiErrors.userNotFound
    }
    return user;
};

const editProfile = async (userId, uid, body, file) => {
    let user = await userModel.findById(userId)
    if(!user){
        throw apiErrors.userNotFound
    }

    if(userId !== uid){
        throw apiErrors.unauthorized
    }

    const existingUsers = await userModel.find({
        $or: [
        { normalizedUserName: body.userName?.toLowerCase()},
        { email: body.email}
        ]
    })

    user.userName = body?.userName;
    user.name = body.name;
    user.lastName = body.lastName;
    user.email = body.email;
    user.description = body?.description
    user.normalizedUserName = body.userName?.toLowerCase();

    if(existingUsers.length === 0){
        await user.validate()
        if(file){
            await changeProfilePic(user, file)
        }
        
        return await user.save()
    }else if (existingUsers.length === 1){
        if(existingUsers[0].id === user.id){
            await user.validate()

            if(file){
                await changeProfilePic(user, file)
            }

            return await user.save()
        }else {
            let error =  new Error()
            error.name  = "ValidationError"
            error.errors = {}
            if(existingUsers[0].userName.toLowerCase() === user.userName.toLowerCase()){
                error.errors.userName = {message: "El nombre de usuario ya está en uso"}
            }
            if(existingUsers[0].email.toLowerCase() === user.email.toLowerCase()){
                error.errors.email = {message: "El correo electrónico ya está registrado"}
            }
            throw error;
        }
    }else if(existingUsers.length === 2){
        let error =  new Error()
        error.name  = "ValidationError"
        error.errors = {}
        if(existingUsers[0].id === user.id){
            // error.errors.email = {message: "El correo electrónico ya está registrado"}
            error.errors.userName = {message: "El nombre de usuario ya está en uso"}

        }else{
            error.errors.email = {message: "El correo electrónico ya está registrado"}
            // error.errors.userName = {message: "El nombre de usuario ya está en uso"}
            
            if(existingUsers[1].id !== user.id){
                // error.errors.email = {message: "El correo electrónico ya está registrado"}
                error.errors.userName = {message: "El nombre de usuario ya está en uso"}

            }
        }
        throw error
    }
}

const changeProfilePic = async (user,file) => {
    if(user.profilePic.public_id !== process.env.DEFAULT_PIC_ID){
        await deleteImage(user.profilePic.public_id)
    }
    const result = await uploadImage(file.path, 'profile', null, 'profile')
    user.profilePic = {
        public_id: result.public_id,
        secure_url : result.secure_url
    }
    await fs.unlink(file.path)

}

const banUser = async (userId, banDate) => {
    let user = await userModel.findById(userId)
        .select('_id userName profilePic.secure_url authorized bannedUntil');
    if(!user){
        throw apiErrors.userNotFound
    }

    if(user.authorized === false){
        throw apiErrors.alreadyBanned
    }
    user.authorized = false
    user.bannedUntil = banDate

    return await user.save()
}

const unBanUser = async (userId) => {
    let user = await userModel.findById(userId)
        .select('_id userName profilePic.secure_url authorized bannedUntil');
    if(!user){
        throw apiErrors.userNotFound;
    }
    if(user.authorized === true){
        throw apiErrors.notBanned
    }
    user.authorized = true;
    user.bannedUntil = null;

    return await user.save();
        
}

const deleteUser = async(userId, uid) => {
    let user = await userModel.findById(userId);
    if(!user){
        throw apiErrors.userNotFound;
    }
    if(userId !== uid){
        throw apiErrors.unauthorized
    }
    user.deleteOn = Date.now() + 30*24*60*60*1000;
    // await badgeService.removeUserFromBadges(user._id);
    await user.save();
    
    return user
}

const changePassword = async (userId,uid, newPassword) => {
    let user = await userModel.findById(userId);
    if(!user){
        throw apiErrors.userNotFound
    }

    if(userId !== uid){
        throw apiErrors.unauthorized
    }

    const isMatch = await user.comparePassword(newPassword);
    if(isMatch){
        throw apiErrors.samePassword
    }

    user.password = newPassword

    await user.save()

}

const markQuizAsCompleted = async (quizId, userId) => {
    await userModel.findByIdAndUpdate(userId, {$addToSet: {completedQuizzes: quizId}})
}

const removeQuizFromUsers = async (quizId) => {
     await userModel.updateMany(
        {completedQuizzes: quizId},
        {$pull:{completedQuizzes: quizId}}
    )
}
// const addBadgeToUser = async (badgeId, userId) => {
//     await userModel.findByIdAndUpdate(userId, {$addToSet: {badges: badgeId}})
// }
const getCompletedQuizzes = async (uid) => {
    let user = await userModel.findById(uid)
    let completedQuizzes = user?.completedQuizzes
    if(!completedQuizzes){
        completedQuizzes = []
    }

    return completedQuizzes
}

const getUsers = async () => {
    let users = await userModel.find()
    .sort({userName: 1})
    .select('_id userName profilePic.secure_url authorized bannedUntil')

    return users
}
export default {
    getUser, 
    editProfile,
    banUser,
    unBanUser,
    deleteUser,
    changePassword,
    // addBadgeToUser,
    markQuizAsCompleted,
    removeQuizFromUsers,
    getCompletedQuizzes,
    getUsers
}