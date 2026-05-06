import { body, param } from "express-validator";
import { contentValidator } from "./commonValidators.js";

export const replyValidator = [
    contentValidator
];