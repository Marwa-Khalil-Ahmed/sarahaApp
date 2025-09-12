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

export const confirmEmailByOTP = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    await emailEvent.emit("verifyOTP", { email, otp });
    
    const user = await userModel.findOneAndUpdate(
      { email },
      { confirmEmail: true },
      { new: true }
    );

    if (!user) {
      return next(new Error("User not found", { cause: 404 }));
    }

    return successResponse({
      res,
      message: "Email verified successfully",
      data: { user },
    });
  } catch (err) {
    return next(new Error(err.message, { cause: 400 }));
  }
});
