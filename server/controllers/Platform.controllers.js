import platformService from '../services/Platform.service.js';


const getPlatforms = async(req,res,next) => {
    try {
        let result = await platformService.getPlatforms();

        return res.status(200).json({result})
    } catch (error) {
        next(error)
    }
}

const createPlatform = async (req,res,next) => {
    try {
        const platform = await platformService.createPlatform(req.body)

        return res.status(200).json({
            msg: "Plataforma creada éxito", 
            createdPlatform: platform})
    } catch (error) {
        next(error)
    }
}

const deletePlatform = async (req,res,next) => {
    try {
        const platformId = req.params.platformId;
        await platformService.deletePlatform(platformId)
        return res.status(200).json({message: "Plataforma eliminada con éxito"})
    } catch (error) {
        next(error)
    }
}



export default  {
    getPlatforms,
    createPlatform,
    deletePlatform
}