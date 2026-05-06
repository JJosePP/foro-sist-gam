import express from 'express';
import { optionalAuth } from "../middlewares/optionalAuth.js";
import { idValidator } from "../middlewares/commonValidators.js";
import { validateRequest } from '../middlewares/validateRequest.js';
import reviewControllers from '../controllers/Review.controllers.js';
import { requireToken } from "../middlewares/requireToken.js";
import { tokenIsInvalid } from "../middlewares/tokenIsInvalid.js";
import { userIsBanned } from "../middlewares/userIsBanned.js";
import { upload } from '../middlewares/multer.js';
import { reviewValidator } from '../middlewares/Review.validators.js';

const router = express.Router();

router.get('/:reviewId', optionalAuth, idValidator("reviewId"), validateRequest, reviewControllers.getReview)
router.put('/:reviewId', requireToken, tokenIsInvalid, userIsBanned, upload.none(), idValidator("reviewId"),reviewValidator, validateRequest, reviewControllers.editReview);
router.delete('/:reviewId', requireToken, tokenIsInvalid, userIsBanned, idValidator("reviewId"), validateRequest, reviewControllers.deleteReview);
export default router;