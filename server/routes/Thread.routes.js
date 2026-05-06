import express from "express";
import threadControllers from "../controllers/Thread.controllers.js";
import replyControllers from "../controllers/Reply.controllers.js";
import { requireToken } from "../middlewares/requireToken.js";
import { tokenIsInvalid } from "../middlewares/tokenIsInvalid.js";
import { userIsBanned } from "../middlewares/userIsBanned.js";
import { upload } from "../middlewares/multer.js";
import { requireModeratorStatus } from "../middlewares/permissions.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import { validateRequest } from '../middlewares/validateRequest.js';
import { replyValidator } from "../middlewares/Reply.validators.js";
import { completeBodyThreadValidator, partialBodyThreadValidator, threadCategoryValidator, threadStatusValidator } from "../middlewares/Thread.validators.js";
import { idValidator } from "../middlewares/commonValidators.js";

const router = express.Router();

router.get('/', threadCategoryValidator, validateRequest, threadControllers.getThreads)
router.get('/:threadId',optionalAuth, idValidator("threadId"), validateRequest, threadControllers.getThread)
router.post('/', requireToken,tokenIsInvalid,userIsBanned,upload.none(),completeBodyThreadValidator, validateRequest, threadControllers.createThread);
router.put('/:threadId',requireToken, tokenIsInvalid, userIsBanned, upload.none(), idValidator("threadId"), partialBodyThreadValidator,validateRequest, threadControllers.editThread)
router.patch('/:threadId', requireToken, tokenIsInvalid, requireModeratorStatus,upload.none(), idValidator("threadId"), threadStatusValidator, validateRequest, threadControllers.changeThreadStatus)

router.get('/:threadId/replies',optionalAuth, idValidator("threadId"), validateRequest, replyControllers.getRepliesByThread)
router.post('/:threadId/replies',requireToken, tokenIsInvalid, userIsBanned, upload.none(), idValidator("threadId"), replyValidator, validateRequest, replyControllers.createReply)

export default router;