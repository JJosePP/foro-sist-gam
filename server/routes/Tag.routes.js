import express from 'express';
import { requireToken } from '../middlewares/requireToken.js';
import { tokenIsInvalid } from '../middlewares/tokenIsInvalid.js';
import { requireAdminStatus } from '../middlewares/permissions.js';
import { upload } from '../middlewares/multer.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { idValidator, nameValidator} from '../middlewares/commonValidators.js';
import tagControllers from '../controllers/Tag.controllers.js'

const router = express.Router();

router.get('/', requireToken,tokenIsInvalid,requireAdminStatus,tagControllers.getTags);
router.post('/', requireToken,tokenIsInvalid,upload.none(),requireAdminStatus,nameValidator("name",2,30),validateRequest,tagControllers.createTag);
router.delete('/:tagId', requireToken,tokenIsInvalid,requireAdminStatus,idValidator("tagId"),validateRequest,tagControllers.deleteTag);


export default router;
