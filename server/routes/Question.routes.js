import express from 'express'
import questionControllers from "../controllers/Question.controllers.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { idValidator, imageValidator } from '../middlewares/commonValidators.js';
import { requireToken } from "../middlewares/requireToken.js";
import { requireAdminStatus } from "../middlewares/permissions.js";
import { tokenIsInvalid } from "../middlewares/tokenIsInvalid.js";
import { userIsBanned } from "../middlewares/userIsBanned.js";
import { queryFieldsValidator, questionValidator } from '../middlewares/Question.validators.js';
import { upload } from '../middlewares/multer.js';

const router = express.Router();

router.get('/', requireToken, tokenIsInvalid, requireAdminStatus, questionControllers.getQuestions);
router.get('/:questionId', requireToken, tokenIsInvalid, userIsBanned, idValidator('questionId'), validateRequest, questionControllers.getQuestion);
router.post('/', requireToken, tokenIsInvalid, requireAdminStatus, upload.array('image'), questionValidator, validateRequest, imageValidator(false), questionControllers.createQuestion);
router.put('/:questionId', requireToken, tokenIsInvalid, requireAdminStatus, upload.array('image'), idValidator('questionId'), questionValidator, validateRequest, imageValidator(false), questionControllers.editQuestion)
router.delete('/:questionId', requireToken, tokenIsInvalid, requireAdminStatus, idValidator('questionId'), validateRequest,questionControllers.deleteQuestion)

export default router;