import userModel from "../../../DB/model/User.model.js";
import { asyncHandler } from "../../../utils/error/error.handling.js";
import { emailEvent } from "../../../utils/events/sendEmail.event.js";
import { successResponse } from "../../../utils/response/success.response.js";

//for profile reactivation & password reset
export const reactivationOTP = asyncHandler(
    async (req, res, next) => {
        const { email } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return next(new Error('User not found.', { cause: 404 }))
        }

        emailEvent.emit("sendReactivationOTP", { email });
        return successResponse({ res, message: "OTP sent to your email" })
    }
);

export const passwordOTP = asyncHandler(
    async (req, res, next) => {
        const { email } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return next(new Error('User not found.', { cause: 404 }))
        }

        emailEvent.emit("sendPasswordOTP", { email });
        return successResponse({ res, message: "OTP sent to your email" })
    }
);