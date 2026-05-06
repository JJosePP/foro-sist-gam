import express from 'express';
import categoryControllers from '../controllers/Category.controllers.js';
import { upload } from '../middlewares/multer.js';
import { requireToken } from '../middlewares/requireToken.js';
import { tokenIsInvalid } from '../middlewares/tokenIsInvalid.js';
import { requireAdminStatus } from '../middlewares/permissions.js';
import { idValidator, nameValidator } from '../middlewares/commonValidators.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

router.get('/', categoryControllers.getCategories);
router.post('/',requireToken,tokenIsInvalid, requireAdminStatus, upload.none(), nameValidator("name",2,30), validateRequest , categoryControllers.createCategory);
router.delete('/:categoryId', requireToken,tokenIsInvalid, requireAdminStatus, idValidator("categoryId"), validateRequest, categoryControllers.deleteCategory)

export default router