import userModel from "../models/User.model.js";

const register = async (body) => {
    const userData = {
        ...body,
        email: body.email.trim(),
        roles: ["user"],
        profilePic: {
            secure_url:
                "https://res.cloudinary.com/jjose/image/upload/v1712680091/questgamer/defaultProfilePic.webp",
        },
    };
    const user = await userModel.create(userData);

    return user;
};

const login = async(body) =>{
    const {userName, password} = body;
    
    let user = await userModel.findOne({userName:userName});
    if(!user){
        let err = new Error("No existe este usuario");
        err.name = "existError"
        err.status = 400;
       throw err;
    }

    const isMatch = await user.comparePassword(password);
    if(!isMatch){
        let err = new Error("Contraseña incorrecta");
        err.name = "invalidPassword"
        err.status = 403
        throw err;
    }

    return user;

}

const infoUser = async (uid) => {
        const user = await userModel.findById(uid);
        return user.userName;
}
export { register, login, infoUser};
