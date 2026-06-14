import express from "express";
import reportControllers from "../controllers/Report.controllers.js";
import { requireToken } from "../middlewares/requireToken.js";
import { tokenIsInvalid } from "../middlewares/tokenIsInvalid.js";
import { userIsBanned } from "../middlewares/userIsBanned.js";
import { requireModeratorStatus } from "../middlewares/permissions.js";
import { idValidator } from "../middlewares/commonValidators.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = express.Router();

router.get('/', requireToken, tokenIsInvalid, requireModeratorStatus, reportControllers.getReports)
router.delete('/:reportId', requireToken, tokenIsInvalid, requireModeratorStatus, idValidator("reportId"), validateRequest, reportControllers.deleteReport)

export default router;