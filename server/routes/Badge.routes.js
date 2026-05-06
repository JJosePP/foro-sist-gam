import express from  "express";
import badgeControllers from '../controllers/Badge.controllers.js';
import { requireToken } from "../middlewares/requireToken.js";
import { tokenIsInvalid } from "../middlewares/tokenIsInvalid.js";
import { requireAdminStatus } from "../middlewares/permissions.js";
import { badgeValidator } from "../middlewares/Badge.validators.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { imageValidator, idValidator } from "../middlewares/commonValidators.js";
import { upload } from "../middlewares/multer.js";


const router = express.Router();

router.get('/', requireToken, tokenIsInvalid, requireAdminStatus, badgeControllers.getBadges);
router.post('/', requireToken,tokenIsInvalid, requireAdminStatus, upload.array('image'), badgeValidator, validateRequest, imageValidator(true), badgeControllers.createBadge);
router.put('/:badgeId', requireToken,tokenIsInvalid, requireAdminStatus, upload.array('image'), idValidator('badgeId'), badgeValidator, validateRequest, imageValidator(false), badgeControllers.editBadge);
router.delete('/:badgeId', requireToken,tokenIsInvalid, requireAdminStatus, idValidator('badgeId'), validateRequest, badgeControllers.deleteBadge);

export default router;