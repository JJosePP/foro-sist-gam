import fs from 'fs-extra';
export const cleanUpUploads = async (err,req,res,next) => {
    if(!req.files && !req.file){
        return next(err)
    }

    const files =[];

    if(req.file){
        files.push(req.file)
    }
    if(req.files instanceof Array){
        req.files.forEach(e => files.push(e))
    }else {
        Object.values(req.files).forEach(arr => files.push(...arr))
    }
    try {
        await Promise.all(
            files.map(file => fs.unlink(file.path))
        )
    } catch (error) {
        console.error("Error limpiando archivos:", error);
    }
    
    next(err)
}