import express from "express";
import replyControllers from "../controllers/Reply.controllers.js";
import { requireToken } from "../middlewares/requireToken.js";
import { tokenIsInvalid } from "../middlewares/tokenIsInvalid.js";
import { userIsBanned } from "../middlewares/userIsBanned.js";
import { upload } from "../middlewares/multer.js";
import { replyValidator } from "../middlewares/Reply.validators.js";
import { validateRequest } from '../middlewares/validateRequest.js';
import { idValidator } from "../middlewares/commonValidators.js";

const router = express.Router();

router.put('/:replyId',requireToken, tokenIsInvalid, userIsBanned, upload.none(), idValidator("replayId"), replyValidator, validateRequest, replyControllers.editReply)

export default router;