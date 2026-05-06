import express from  "express";
import { upload } from "../middlewares/multer.js";
import { requireToken } from "../middlewares/requireToken.js";
import gameControllers from "../controllers/Game.controllers.js";
import { requireAdminStatus } from "../middlewares/permissions.js";
import { tokenIsInvalid } from "../middlewares/tokenIsInvalid.js";
import { idValidator, mainImageValidator, validateOptionalScreenshots } from "../middlewares/commonValidators.js"
import { validateRequest } from "../middlewares/validateRequest.js"
import { gameValidator, searchValidator, imageIdValidator} from "../middlewares/Game.validators.js";
import ReviewControllers from "../controllers/Review.controllers.js";
import { userIsBanned } from "../middlewares/userIsBanned.js";
import { reviewValidator } from "../middlewares/Review.validators.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";
const router = express.Router();


router.get('/', gameControllers.getGames)
router.get('/search', searchValidator, validateRequest, gameControllers.searchGames)
router.get('/:gameId',idValidator("gameId"), validateRequest,gameControllers.getGame)
router.post('/', requireToken,tokenIsInvalid,requireAdminStatus, upload.fields([{name: 'mainImage'},{name: 'screenshots'}]),gameValidator,validateRequest,mainImageValidator(true),validateOptionalScreenshots,gameControllers.createGame)
router.put('/:gameId',requireToken,tokenIsInvalid,requireAdminStatus, upload.fields([{name: 'mainImage'},{name: 'screenshots'}]),idValidator("gameId"),gameValidator,validateRequest, mainImageValidator(false), validateOptionalScreenshots,gameControllers.editGame)
router.put('/:gameId/:imageId', requireToken,tokenIsInvalid, requireAdminStatus, idValidator("gameId"), imageIdValidator,validateRequest, gameControllers.deleteScreenshot)
router.delete('/:gameId', requireToken,tokenIsInvalid, requireAdminStatus,idValidator("gameId"), validateRequest, gameControllers.deleteGame)

router.post('/:gameId/reviews', requireToken, tokenIsInvalid, userIsBanned, upload.none(), idValidator("gameId"), reviewValidator, validateRequest, ReviewControllers.createReview)
router.get('/:gameId/reviews', optionalAuth, idValidator("gameId"),validateRequest, ReviewControllers.getReviewsByGames)

export default router;