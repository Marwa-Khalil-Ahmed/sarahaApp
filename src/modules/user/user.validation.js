import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js"

export const updateProfile = joi.object().keys({
    userName: generalFields.userName,
    phone: generalFields.phone,
    gender: generalFields.gender,
    DOB: joi.date().less("now")
}).required()


export const updatePassword = joi.object().keys({
    oldPassword: generalFields.password.required(),
    password: generalFields.password.not(joi.ref('oldPassword')).required(),
    confirmPassword: generalFields.confirmPassword.valid(joi.ref('password')).required()
}).required();



export const resetPassword = joi.object({
    email: generalFields.email.required(),
    otp: generalFields.otp.required(),
    newPassword: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword.valid(joi.ref('newPassword')).required()
}).required();


export const reactivateProfile = joi.object().keys({
    otp: generalFields.otp.required(),
    email: generalFields.email.required()
}).required();

export const shareProfile = joi.object().keys({
    userId: generalFields.id.required()
}).required();
