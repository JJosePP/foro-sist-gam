import express from "express";
import AuthController from "../controllers/Authenticaction.controllers.js";
import { requireToken } from "../middlewares/requireToken.js";
import { requireRefreshToken } from "../middlewares/requireRefreshToken.js";
import { upload } from "../middlewares/multer.js";
import { tokenIsInvalid } from '../middlewares/tokenIsInvalid.js';
import { passwordValidator, userValidator, loginValidator} from "../middlewares/User.validators.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { imageValidator } from "../middlewares/commonValidators.js";

const router = express.Router();

router.post("/register", upload.array('image'),userValidator, passwordValidator, validateRequest, imageValidator(false), AuthController.register);
router.post("/login", upload.none(), loginValidator, validateRequest,AuthController.login);

// despues del requireRefrestoken poner tb el middleware para ver si está ban
router.get("/refresh",requireRefreshToken, AuthController.refreshToken) 
router.post("/logout", requireToken,tokenIsInvalid, AuthController.logout)

export default router;