import express from 'express';
import {upload} from '../middlewares/multer.js';
import { requireToken } from '../middlewares/requireToken.js';
import userController from '../controllers/User.controllers.js';
import { requireModeratorStatus } from '../middlewares/permissions.js';
import { tokenIsInvalid } from '../middlewares/tokenIsInvalid.js';
import { userIsBanned } from '../middlewares/userIsBanned.js';
import { idValidator, imageValidator } from '../middlewares/commonValidators.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { userValidator, banDateValidator, passwordValidator } from '../middlewares/User.validators.js';
import { optionalAuth } from "../middlewares/optionalAuth.js";


const router = express.Router();

router.get("/:userId",requireToken,tokenIsInvalid,userIsBanned,idValidator("userId"), validateRequest,userController.getUser);
router.put('/:userId', requireToken,tokenIsInvalid,userIsBanned,upload.array('image'),idValidator("userId"), userValidator, validateRequest,imageValidator(false), userController.editProfile);
router.put('/ban/:userId',requireToken, tokenIsInvalid,requireModeratorStatus, upload.none(), idValidator("userId"), banDateValidator, validateRequest, userController.banUser);
router.put('/unban/:userId', requireToken, tokenIsInvalid, requireModeratorStatus, upload.none(), idValidator("userId"), validateRequest, userController.unBanUser);
router.delete('/:userId', requireToken, tokenIsInvalid, userIsBanned,idValidator("userId"), validateRequest,userController.deleteUser);
router.patch('/changePassword/:userId', requireToken, tokenIsInvalid,userIsBanned, upload.none(), idValidator("userId"),passwordValidator,validateRequest,userController.changePassword);
router.get('/:userId/completedQuizzes', optionalAuth,tokenIsInvalid,userIsBanned,idValidator("userId"), validateRequest,userController.getCompletedQuizzes)
router.get('/', requireToken, tokenIsInvalid, requireModeratorStatus,userController.getUsers)
export default router;