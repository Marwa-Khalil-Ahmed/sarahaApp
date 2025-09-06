import joi from "joi";
import { genderTypes } from "../DB/model/User.model.js";
import { Types } from "mongoose";

export const validateObjectId = (value, helper) => {
    return Types.ObjectId.isValid(value)
        ? true
        : helper.message("Invalid ObjectId");
};

export const generalFields = {
    userName: joi.string().min(2).max(25).messages({
        'string.min': 'Username must be at least 2 characters long',
        'string.max': 'Username cannot exceed 25 characters',
        'string.empty': 'Username cannot be empty',
        'any.required': 'Username is required'
    }),
    email: joi.string().email({ minDomainSegments: 2, maxDomainSegments: 3, tlds: { allow: ['com', 'edu'] } }).messages({
        'string.email': 'Please enter valid email format like example@gmail.com',
        'string.empty': 'email cannot be empty',
        'any.required': 'Email is required'
    }),
    password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).messages({
        'string.pattern.base': 'Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, and one number',
        'string.empty': 'Password cannot be empty',
        'any.required': 'Password is required'
    }),
    confirmPassword: joi.string().messages({
        'any.only': 'Confirm password must match the password',
        'string.empty': 'Confirm password cannot be empty',
        'any.required': 'Confirm password is required'
    }),
    phone: joi.string().pattern(new RegExp(/^(002|\+20)?01[0125][0-9]{8}$/)).messages({
        'string.pattern.base': 'Phone number must be a valid Egyptian phone number starting with 002, +20, or 01 followed by 9 digits',
        'string.empty': 'Phone number cannot be empty',
        'any.required': 'Phone number is required'
    }),
    gender: joi.string().valid(genderTypes.male, genderTypes.female),
    otp: joi.string().pattern(/^\d{6}$/).messages({
        'string.empty': 'OTP is required.',
        'string.pattern.base': 'OTP must be a 6-digit number.',
    }),
    acceptLanguage: joi.string().valid("en", "ar").default("en"),
    id: joi.string().custom(validateObjectId).required()


}

export const validation = (schema) => {
    return (req, res, next) => {
        const inputData = { ...req.body, ...req.query, ...req.params };
        if (req.headers['accept-language']) {
            inputData['accept-language'] = req.headers['accept-language'];
        }
        const validationError = schema.validate(inputData, { abortEarly: false });
        if (validationError.error) {
            return res.status(400).json({ message: "Validation Result", validationError: validationError.error.details })
        }
        return next();
    }
}