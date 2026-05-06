import express from "express";
import { requireToken } from "../middlewares/requireToken.js";
import { requireAdminStatus } from "../middlewares/permissions.js";
import genreControllers from "../controllers/Genre.controllers.js";
import { upload } from "../middlewares/multer.js";
import { tokenIsInvalid } from "../middlewares/tokenIsInvalid.js";
import { idValidator, nameValidator } from "../middlewares/commonValidators.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = express.Router();

router.get(
    "/",
    genreControllers.getGenres,
);
router.post(
    "/",
    requireToken,
    tokenIsInvalid,
    upload.none(),
    requireAdminStatus,
    nameValidator("name",2,30),
    validateRequest,
    genreControllers.createGenre,
);
router.delete(
    "/:genreId",
    requireToken,
    tokenIsInvalid,
    requireAdminStatus,
    idValidator("genreId"),
    validateRequest,
    genreControllers.deleteGenre,
);



export default router;