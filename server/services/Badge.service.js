import badgeModel from '../models/Badge.model.js';
import { apiErrors } from '../utils/apiErrors.js';
import { deleteImage, uploadImage } from '../utils/cloudinary.js';
import { normalizeName } from '../utils/namedEntitySchema.js';
import fs from 'fs-extra';

//Borrar
// const removeUserFromBadges = async (userId) => {
//     await badgeModel.updateMany(
//         {users: userId},
//         {$pull:{users: userId}}
//     )
// }
//Borrar
// const insertUserToBadges = async (badgeIds, userId) => {
//     await badgeModel.updateMany(
//         {_id: {$in: badgeIds}},
//         {$addToSet: {users: userId}}
//     )
// }
//Borrar
// const insertUserToBadge = async (badgeId, userId) => {
//     await badgeModel.findByIdAndUpdate(badgeId, {
//         $addToSet: { users: userId}
//     })
// }

// const asociateBadgeToQuiz = async(badgeId, quizId) => {
//     await badgeModel.findByIdAndUpdate(badgeId,{quiz: quizId}, {runValidators: true});
// }

// const getBadges = async (page) => {
//     let hasNextPage = false;
//     let resultsPerPage = 10;

//     let [result, totalItems] = await Promise.all([
//         badgeModel.find()
//             .select("-users")
//             .sort({name: 1, _id: 1})
//             .skip((page - 1) * resultsPerPage)
//             .limit(resultsPerPage + 1),
//         badgeModel.countDocuments()
//     ])

//     if(result.length > resultsPerPage){
//         hasNextPage = true
//         result.pop()
//     }

//     return {
//         data: result,
//         currentPage: page,
//         hasNextPage,
//         totalPages: Math.ceil(totalItems/resultsPerPage),
//         totalItems: totalItems
//     }
// }

// const createBadge = async(body, file) => {
//     let normalizedName = normalizeName(body.name)
//     console.log(normalizedName)
//     let existingBadge = await badgeModel.exists({normalizedName: normalizedName});
//     console.log(existingBadge)
//     if(existingBadge){
//         throw apiErrors.existingBadge;
//     }
//     let badge = new badgeModel({
//         name: body.name.replace(/\s* \s*/g,' '),
//         normalizedName: normalizedName
//     })
//     console.log(badge)
//     let result = await uploadImage(file.path, 'badges', null, 'image');
//     badge.image = {
//         public_id: result.public_id,
//         secure_url: result.secure_url
//     }
//     await fs.unlink(file.path);

//     await badge.save()
// }

// const editBadge = async (badgeId, body, file) => {
//     let uploadedImage = null;
//     try {
//         let badge = await badgeModel.findById(badgeId);
//         if(!badge){
//             throw apiErrors.badgeNotFound;
//         }
//         badge.name = body.name.replace(/\s* \s*/g,' ');
//         badge.normalizedName = normalizeName(body.name);

//         if(file){
//             const result = await uploadImage(file.path, 'badges', null, 'image');
//             uploadedImage = result.public_id;
//             await deleteImage(badge.image.public_id);
//             badge.image = {
//                 public_id: result.public_id,
//                 secure_url: result.secure_url
//             }
//             await fs.unlink(file.path)
//         }

//         return await badge.save()
//     } catch (error) {
//         if(uploadedImage){
//             await deleteImage(uploadedImage)
//         }
//         throw error
//     }
// }

// const deleteBadge = async (badgeId, quizId) => {
//     let badge = await badgeModel.findById(badgeId);
//     if(!badge){
//         throw apiErrors.badgeNotFound;
//     }

//     if(badge.quiz && !badge.quiz?.equals(quizId)){
//         throw apiErrors.deletingBadge
//     }
//     await badge.deleteOne();
//     await deleteImage(badge.image.public_id)
// }

// const badgebelongsToQuiz = async (badgeId) => {
//     let res = false;
//     let badge = await badgeModel.findById(badgeId);
//     if(badge?.quiz){
//         res = true
//     }

//     return res;
// }

export default {
    // removeUserFromBadges,
    // insertUserToBadges,
    // insertUserToBadge,
    // asociateBadgeToQuiz,
    // getBadges,
    // createBadge,
    // editBadge,
    // deleteBadge,
    // badgebelongsToQuiz
}