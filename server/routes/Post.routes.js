import express from 'express';
import { requireToken } from '../middlewares/requireToken.js';
import {tokenIsInvalid} from "../middlewares/tokenIsInvalid.js"
import { userIsBanned } from "../middlewares/userIsBanned.js";
import postControllers from '../controllers/Post.controllers.js';
import { upload } from "../middlewares/multer.js";
import { moderateValidator, voteValidator, postUserValidator } from '../middlewares/Post.validators.js';
import { idValidator } from '../middlewares/commonValidators.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { requireModeratorStatus } from '../middlewares/permissions.js';
import reportControllers from "../controllers/Report.controllers.js";
import { reportValidator } from '../middlewares/Report.validators.js';


const router = express.Router();

router.put('/:postId/vote/:vote', requireToken, tokenIsInvalid, userIsBanned,upload.none(),idValidator('postId'), voteValidator, validateRequest, postControllers.votePost);
router.put('/:postId/moderate', requireToken, tokenIsInvalid, requireModeratorStatus, upload.none(), idValidator('postId'), moderateValidator, validateRequest, postControllers.moderatePost)
router.get('/', requireToken, tokenIsInvalid, userIsBanned, upload.none(), postUserValidator, validateRequest, postControllers.numPostByUserAndLatestPost)

router.post('/:postId/report', requireToken, tokenIsInvalid, userIsBanned, upload.none(), idValidator('postId'), reportValidator, validateRequest, reportControllers.createReport)

export default router