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
        const category = await categoryService.createCategory(req.body, req.files[0]);

        console.log(category)
        return res.status(200).json({
            msg: "Categoría creada con éxito",
            createdCategory: category
        })
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

const getCategory = async (req,res,next) => {
    try {
        let category = await categoryService.getCategory(req.params.categoryId)
        return res.status(200).json({category})
    } catch (error) {
        next(error)
    }
}

// const addImage = async (req,res,next) => {
//     try {
//         await categoryService.addImage(req.params.categoryId, req.files[0]);
//         return res.status(200).json("Añadida")
//     } catch (error) {
//         next(error)
//     }
// }
// const addDescription = async (req,res,next) => {
//     try {
//         await categoryService.addDescription(req.params.categoryId, req.body.description)
//         return res.status(200).json("Añadida")
//     } catch (error) {
//         next(error)
//     }
// }

export default {
    getCategory,
    getCategories,
    createCategory,
    deleteCategory,
    // addImage
    // addDescription
}

