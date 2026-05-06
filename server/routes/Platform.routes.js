import express from 'express'
import { requireToken } from '../middlewares/requireToken.js';
import { requireAdminStatus } from '../middlewares/permissions.js';
import platformControllers from '../controllers/Platform.controllers.js';
import { upload } from "../middlewares/multer.js";
import {tokenIsInvalid} from "../middlewares/tokenIsInvalid.js"
import { idValidator, nameValidator } from '../middlewares/commonValidators.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

router.get('/',platformControllers.getPlatforms)
router.post('/', requireToken,tokenIsInvalid, requireAdminStatus, upload.none(), nameValidator("name",2,30), validateRequest,platformControllers.createPlatform)
router.delete('/:platformId', requireToken,tokenIsInvalid, requireAdminStatus, idValidator("platformId"), validateRequest,platformControllers.deletePlatform)
export default router