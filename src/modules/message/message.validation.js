import joi from "joi"
import { generalFields } from "../../middleware/validation.middleware.js"

export const sendMessage = joi.object().keys({
    message: joi.string().pattern(new RegExp(/^[a-zA-Z\u0621-\u064Aء-ئ][^#&<>\"~;$^%{}?]{2,50000}$/)).required(),
    recepientId: generalFields.id.required(),
}).required();