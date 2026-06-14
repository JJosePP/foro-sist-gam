import express from 'express';
import categoryControllers from '../controllers/Category.controllers.js';
import { upload } from '../middlewares/multer.js';
import { requireToken } from '../middlewares/requireToken.js';
import { tokenIsInvalid } from '../middlewares/tokenIsInvalid.js';
import { requireAdminStatus } from '../middlewares/permissions.js';
import { idValidator, imageValidator } from '../middlewares/commonValidators.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {categoryValidator} from '../middlewares/Category.validators.js'

const router = express.Router();

router.get('/', categoryControllers.getCategories);
router.get('/:categoryId',idValidator("categoryId"), validateRequest, categoryControllers.getCategory)
router.post('/',requireToken,tokenIsInvalid, requireAdminStatus, upload.array('image'), categoryValidator, validateRequest, imageValidator(true), categoryControllers.createCategory);
router.delete('/:categoryId', requireToken,tokenIsInvalid, requireAdminStatus, idValidator("categoryId"), validateRequest, categoryControllers.deleteCategory)


// router.put('/:categoryId/addImage', upload.array('image'), categoryControllers.addImage)
// router.put('/:categoryId/addDescription', upload.none(), categoryControllers.addDescription)
export default router