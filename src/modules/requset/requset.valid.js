import joi from "joi";
import { information, isValid } from "../../middleware/validation.js";


export const sendRequest = joi.object().keys({
    userId: joi.custom(isValid),
    documentType: joi.string().required(),
    branchType: joi.string().required(),
    firstWitnesses: joi.custom(isValid).required(),
    secWitnesses: joi.custom(isValid).required(),
    Sheikh: joi.custom(isValid).required(),
    orderNumber: joi.number().required(),
    file: information.attachment.required()
}).required()