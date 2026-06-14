import categoryModel from "../models/Category.model.js";
import threadModel from '../models/Thread.model.js';
import { apiErrors } from "../utils/apiErrors.js";
import { normalizeName } from "../utils/namedEntitySchema.js";
import { deleteImage, uploadImage } from "../utils/cloudinary.js";
import fs from 'fs-extra';

const getCategories = async () => {
    const result = await categoryModel.find().sort({name:1, _id:1}).select('_id name image.secure_url description');

    return result;
}

const createCategory = async (categoryData, file) => {
    let uploadedImage = null
    try {
        let normalizedName = normalizeName(categoryData.name)
        let existingCategory = await categoryModel.exists({normalizedName: normalizedName});
    
        if(existingCategory){
            throw apiErrors.existingCategory;
        }
    
        // const category = await categoryModel.create({
        //     name: categoryData.name.replace(/\s* \s*/g,' '),
        //     normalizedName: normalizedName
        // });
        const category = new categoryModel({
            name: categoryData.name.replace(/\s* \s*/g,' '),
            normalizedName: normalizedName,
            description: categoryData.description
        });
    
        let result = await uploadImage(file.path, 'categories', null, 'image');
        uploadedImage = result.public_id
        category.image = {
            public_id: result.public_id,
            secure_url: result.secure_url
        }
        await fs.unlink(file.path)
    
    
        await category.save()
        return category
        
    } catch (error) {
        if(uploadedImage){
            await deleteImage(uploadedImage)
        }
        throw error;
    }
}

const deleteCategory = async (categoryId) => {
    // let category = await categoryModel.findByIdAndDelete(categoryId);

    let category = await categoryModel.findById(categoryId);
    if(!category){
        throw apiErrors.categoryNotFound
    }
    await category.deleteOne()
    await deleteImage(category.image.public_id)
    await threadModel.deleteMany({category:category.id})
}

const getCategory = async (categoryId) => {
    let category = await categoryModel.findById(categoryId).select('-normalizedName -image.public_id');
    if(!category){
        throw apiErrors.categoryNotFound
    }

    return category
}

// const addImage = async (categoryId, file) => {
//     let uploadedImage = null
//     try {
//         let category = await categoryModel.findById(categoryId)
//         if(!category){
//             throw apiErrors.existingCategory;
//         }
//         let result = await uploadImage(file.path, 'categories', null, 'image');
//         uploadedImage = result.public_id
//         category.image = {
//             public_id: result.public_id,
//             secure_url: result.secure_url
//         }
//         await fs.unlink(file.path)
//         await category.save()
//     } catch (error) {
//         if(uploadedImage){
//             await deleteImage(uploadedImage)
//         }
//         throw error;
//     }
// }

// const addDescription = async (categoryId, description) => {
//     let category = await categoryModel.findById(categoryId)
//     if(!category){
//         throw apiErrors.existingCategory;
//     }

//     category.description = description
//     await category.save()
// }
export default {
    getCategory,
    getCategories,
    createCategory,
    deleteCategory,
    // addImage
    // addDescription
}