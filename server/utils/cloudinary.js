import {v2 as cloudinary} from 'cloudinary'
import "dotenv/config"
import sharp from 'sharp';
import path from 'path'
import fs from 'fs-extra'
import { apiErrors } from './apiErrors.js';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

sharp.cache(false);

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const x = {
    "mainImage": "imagen principal",
    "screenshot": "captura de pantalla",
    "profile": "imagen de perfil",
    "image": "imagen"
}

export async function uploadImage(filePath, type, game = null, context){
    try {
        let stats
        let tempWebpPath
        if(path.extname(filePath) === '.webp'){
            stats = await fs.stat(filePath);

            if(stats.size > MAX_FILE_SIZE){
                throw new Error(`La ${x[context]} supera el límite de 10 MB (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
            }
        }else{
            tempWebpPath = path.join(
                path.dirname(filePath),
                `${path.parse(filePath).name}.webp`
            );
            //Convertimos la imagen a .webp
            await sharp(filePath).webp({quality: 85}).toFile(tempWebpPath);
            stats = await fs.stat(tempWebpPath);

            if (stats.size > MAX_FILE_SIZE){
                await fs.unlink(tempWebpPath)
    
                throw new Error(`La ${x[context]} convertida supera el límite de 10 MB (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
            }
        }

        let folder = process.env.CLOUDINARY_FOLDER + type;
        if (type === 'games'){
            folder = folder + '/' + game
        };
        
        let result = await cloudinary.uploader.upload(filePath,{
            folder: folder,
            format: 'webp'
        });

        if(tempWebpPath){
            await fs.unlink(tempWebpPath);
        }

        return result;
        
    } catch (error) {
        apiErrors.uploadError.title = `Error al procesar ${x[context]}`
        apiErrors.uploadError.details = error.message
        throw apiErrors.uploadError;
    }
    
}

export async function deleteImage(publicId) {
    return await cloudinary.uploader.destroy(publicId)
}

export async function deleteFolder(path) {
    return await cloudinary.api.delete_folder(path)
}

export async function deleteImages(path) {
    return await cloudinary.api.delete_resources_by_prefix(path)
}