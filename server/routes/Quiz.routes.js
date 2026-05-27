import express from 'express';
import quizControllers from '../controllers/Quiz.controllers.js';
import { requireAdminStatus } from "../middlewares/permissions.js";
import { tokenIsInvalid } from "../middlewares/tokenIsInvalid.js";
import { requireToken } from "../middlewares/requireToken.js";
import { quizValidator, partialQuizValidator } from '../middlewares/Quiz.validators.js';
import { validateRequest } from "../middlewares/validateRequest.js"
import { idValidator } from '../middlewares/commonValidators.js';
import { upload } from '../middlewares/multer.js';
import { userIsBanned } from '../middlewares/userIsBanned.js';
import quizSessionControllers from '../controllers/QuizSession.controllers.js';

const router = express.Router();

router.get('/', quizControllers.getQuizzes);
router.get('/totalQuizzes', requireToken, tokenIsInvalid, userIsBanned, upload.none(), quizControllers.getNumQuizzes)
router.post('/', requireToken, tokenIsInvalid, requireAdminStatus, upload.none(), quizValidator, validateRequest, quizControllers.createQuiz);
router.put('/:quizId', requireToken, tokenIsInvalid, requireAdminStatus, upload.none(), idValidator("quizId"), partialQuizValidator, validateRequest, quizControllers.editQuiz);
router.delete('/:quizId', requireToken, tokenIsInvalid, requireAdminStatus, idValidator("quizId"), validateRequest, quizControllers.deleteQuiz)

router.post('/:quizId/start', requireToken, tokenIsInvalid, userIsBanned, upload.none(), idValidator("quizId"), validateRequest, quizSessionControllers.createSession)
router.post('/session/:sessionId/answer', requireToken, tokenIsInvalid, userIsBanned, upload.none(), idValidator("sessionId"), validateRequest, quizSessionControllers.answerQuestion)
export default router;