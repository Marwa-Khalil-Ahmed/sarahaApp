import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const signup = joi.object().keys({
    userName: generalFields.userName.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword.valid(joi.ref('password')).required(),
    phone: generalFields.phone.required(),
    'accept-language': generalFields.acceptLanguage

}).options({ allowUnknown: false }).required()



export const login = joi.object().keys({
    email: generalFields.email.required(),
    password: generalFields.password.required()
}).options({ allowUnknown: false }).required();

export const sendOtpEmail = joi.object().keys({
    email: generalFields.email.required()
});