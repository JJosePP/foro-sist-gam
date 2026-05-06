import platformModel from '../models/Platform.model.js';
import gameModel from "../models/Game.model.js";
import { apiErrors } from '../utils/apiErrors.js';
import { normalizeName } from "../utils/namedEntitySchema.js";

const getPlatforms = async () => {
    const result = await platformModel.find().sort({name: 1, _id:1}).select('_id name');

    return result;
}

const createPlatform = async (platformData) => {
    let normalizedName = normalizeName(platformData.name)
    let existingPlatform = await platformModel.exists({normalizedName: normalizedName})

    if(existingPlatform) {
        throw apiErrors.existingPlatform
    }

    const platform = await platformModel.create({
        normalizedName:normalizedName,
        name: platformData.name.replace(/\s* \s*/g,' ')
    });

    return platform

}

const deletePlatform = async (platformId) => {
    let platform = await platformModel.findByIdAndDelete(platformId)
    if(!platform){
        throw apiErrors.platformNotFound
    }

    await gameModel.updateMany(
        {platforms: platform.id},
        {$pull:{platforms: platform.id}});

}



export default {
    getPlatforms,
    createPlatform,
    deletePlatform
}