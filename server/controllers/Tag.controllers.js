import tagService from "../services/Tag.service.js";

const getTags = async (req,res,next) => {
    try {
        let result = await tagService.getTags();
        return res.status(200).json({result});
    } catch (error) {
        next(error)
    }
}

const createTag = async (req,res,next) => {
    try {
        const tag = await tagService.createTag(req.body)
        return res.status(200).json({
            msg: "Etiqueta creada éxito", 
            createdTag: tag})
    } catch (error) {
        next(error)
    }
}

const deleteTag = async (req,res,next) => {
    try {
        await tagService.deleteTag(req.params.tagId)
        return res.status(200).json({message: "Etiqueta eliminada con éxito"})
    } catch (error) {
        next(error)
    }
}
export default {
    getTags,
    createTag,
    deleteTag
}