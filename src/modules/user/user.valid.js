import joi from "joi";
import { isValid } from "../../middleware/validation.js";


export const code = joi.object().keys({
    id: joi.custom(isValid)
}).required()

export const confirmCode = joi.object().keys({
    code: joi.string().required(),
    id: joi.custom(isValid)
}).required()