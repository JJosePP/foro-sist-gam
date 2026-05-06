import tagModel from '../models/Tag.model.js';
import quizModel from '../models/Quiz.model.js';
import questionModel from '../models/Question.model.js'
import { apiErrors } from '../utils/apiErrors.js';
import { normalizeName } from "../utils/namedEntitySchema.js";

const getTags = async () => {
    return await tagModel.find().sort({name:1, _id:1}).select('_id name');
}

const createTag = async (tagData) => {
    let normalizedName = normalizeName(tagData.name)  
    let existingTag = await tagModel.exists({normalizedName: normalizedName});

    if(existingTag){
        throw apiErrors.existingTag
    }


    const tag = await tagModel.create({
        name: tagData.name.replace(/\s* \s*/g,' '),
        normalizedName: normalizedName
    })

    return tag;
}

//PROBAR CUANDO TENGA QUIZ Y QUESTIONS
const deleteTag = async (tagId) => {
    let tag = await tagModel.findByIdAndDelete(tagId);
    if(!tag){
        throw apiErrors.tagNotFound;
    }
    await Promise.all([
        quizModel.updateMany(
            {tags: tag.id},
            {$pull: {tags: tag.id}}
        ),
        questionModel.updateMany(
            {tags: tag.id},
            {$pull: {tags: tag.id}}
        )
    ])
}

export default {
    getTags,
    createTag,
    deleteTag
}