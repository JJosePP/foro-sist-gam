import jwt from "jsonwebtoken";

export const optionalAuth = (req, res, next) => {
    let token = req.headers?.authorization;
    if(!token){
        return next()
    } 
    
    try {
        token = token.split(" ")[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.uid = payload.uid;
        req.tokenId = payload.tokenId;
        req.roles = payload.roles;
        
    } catch (error) {
        // token inválido → se comporta como usuario anónimo
    }

    next()
}