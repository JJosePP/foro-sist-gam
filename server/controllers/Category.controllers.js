import categoryService from '../services/Category.service.js'

const getCategories = async(req,res,next) => {
    try {
        let result = await categoryService.getCategories();

        return res.status(200).json({result})
    } catch (error) {
        next(error)
    }
}

const createCategory = async (req, res, next) => {
    try {
        const category = await categoryService.createCategory(req.body);

        return res.status(200).json({category})
    } catch (error) {

        next(error)
    }
}

const deleteCategory = async (req,res,next) => {
    try {
        const categoryId = req.params.categoryId;
        await categoryService.deleteCategory(categoryId);
        return res.status(200).json({message: 'Categoría eliminada con éxito'})

    } catch (error) {
        next(error)
    }
}

export default {
    getCategories,
    createCategory,
    deleteCategory
}

