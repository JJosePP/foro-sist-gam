import categoryModel from "../models/Category.model.js";
import threadModel from '../models/Thread.model.js';
import { apiErrors } from "../utils/apiErrors.js";
import { normalizeName } from "../utils/namedEntitySchema.js";


const getCategories = async () => {
    const result = await categoryModel.find().sort({name:1, _id:1}).select('_id name');

    return result;
}

const createCategory = async (categoryData) => {
    let normalizedName = normalizeName(categoryData.name)
    let existingCategory = await categoryModel.exists({normalizedName: normalizedName});

    if(existingCategory){
        throw apiErrors.existingCategory;
    }

    const category = await categoryModel.create({
        name: categoryData.name.replace(/\s* \s*/g,' '),
        normalizedName: normalizedName
    });

    return category
}

const deleteCategory = async (categoryId) => {
    let category = await categoryModel.findByIdAndDelete(categoryId);
    if(!category){
        throw apiErrors.categoryNotFound
    }
    await threadModel.deleteMany({category:category.id})

}

export default {
    getCategories,
    createCategory,
    deleteCategory
}