import express from "express";
import {AuthenticationController} from "../controllers/index.js";

import { requireToken } from "../middlewares/requireToken.js";
import { requireRefreshToken } from "../middlewares/requireRefreshToken.js";
const router = express.Router();

//...
router.route("/").get((req, res) => {
    res.send("hi this is authentication");
});
router.get("/2", (req, res) => {
    res.send("hi this is authentication 2");
});

router.post("/register", AuthenticationController.register);
router.post("/login", AuthenticationController.login);

//ruta de ejemplo. Usar requireToken para todas las rutas en las que se necesite estar logeado
router.get("/protected",requireToken,AuthenticationController.infoUser);

router.get("/refresh",requireRefreshToken, AuthenticationController.refreshToken)
router.get("/logout", AuthenticationController.logout)

export default router;