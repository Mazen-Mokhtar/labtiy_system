import joi from "joi"
import { Types } from "mongoose"

export const validation = (schema) => {
    return (req, res, next) => {
        const allData = { ...req.body, ...req.params, ...req.query, file: req.file }
        console.log(allData)
        if (req.headers.authorization) {
            allData.authorization = req.headers.authorization
        }
        let result = schema.validate(allData, { abortEarly: false })
        if (result.error) {
            result = result.error.details.map((obj) => {
                return obj.message
            })
            return next(new Error(result, { cause: 400 }));
        }
        return next()
    }
}
export const isValid = (value, helpers) => {
    if (!Types.ObjectId.isValid(value)) return helpers.message("invalid id")
    return value
}


export const information= {
    attachment :joi.object({
            fieldname: joi.string().required(),
            originalname: joi.string().required(),
            encoding: joi.string().required(),
            mimetype: joi.string().required(),
            destination: joi.string().required(),
            filename: joi.string().required(),
            path: joi.string().required(),
            size: joi.number().required()
        }),
    
}