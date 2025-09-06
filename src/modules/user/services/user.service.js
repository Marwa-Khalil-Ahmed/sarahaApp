import userModel from "../../../DB/model/User.model.js";
import { asyncHandler } from "../../../utils/error/error.handling.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { decodeEncryption, generateEncryption } from "../../../utils/hash/encryption.js";
import { compareHash, generateHash } from "../../../utils/hash/hash.js";
import { messageModel } from "../../../DB/model/Message.model.js"



export const shareProfile = asyncHandler(
    async (req, res, next) => {
        const user = await userModel.findById(req.params.userId).select("userName image gender DOB");
        return user ? successResponse({ res, data: { user } }) : next(new Error("In-valid account ID"))
    }
)

export const userProfile = asyncHandler(
    async (req, res, next) => {
        const user = req.user;
        user.phone = decodeEncryption({ ciphertext: user.phone });
        const messages = await messageModel.find({ recepientId: user._id, deleted: false }).populate([{
            path: "recepientId",
            select: "-password",
        }]).limit(10).sort({ createdAt: -1 }); // Sort messages by most recent

        return successResponse({
            res, data: {
                user: {
                    id: user._id,
                    name: user.userName,
                    email: user.email,
                    phone: user.phone,
                    gender: user.gender,
                    DOB: user.DOB,
                    image: user.image,
                },
                messages: messages.map(message => ({
                    id: message._id,
                    message: message.message,
                    sentAt: message.createdAt,
                }))
            }
        })
    }
)

export const updateProfile = asyncHandler(
    async (req, res, next) => {
        if (req.body.phone) {
            req.body.phone = generateEncryption({ plaintext: req.body.phone });
        }
        const user = await userModel.findByIdAndUpdate(req.user._id, req.body, { new: true });
        return successResponse({ res, status: 201, message: "Profile Updated Sucessfully", data: { user } })
    }
)

export const updatePassword = asyncHandler(
    async (req, res, next) => {
        const { oldPassword, password } = req.body;
        if (!compareHash({ plaintext: oldPassword, hashValue: req.user.password })) {
            return next(new Error('Old password is incorrect.', { cause: 400 }))
        }
        const hashedPassword = generateHash({ plaintext: password });
        const user = await userModel.findByIdAndUpdate(req.user._id, { password: hashedPassword, credentialsChangeTime: Date.now() }, { new: true });

        return successResponse({ res, status: 201, message: "Password Updated Sucessfully" })
    }
)

export const freezePofile = asyncHandler(
    async (req, res, next) => {
        const user = await userModel.findByIdAndUpdate(req.user._id, { deleted: true, credentialsChangeTime: Date.now() }, { new: true });
        return successResponse({ res, status: 201, message: "Account Frozen Sucessfully" })
    }
)

export const reactivateProfile = asyncHandler(
    async (req, res, next) => {
        const { email, otp } = req.body;

        // Find the user and verify OTP
        const user = await userModel.findOne({ email });
        if (!user) {
            return next(new Error('User not found.', { cause: 404 }))
        }

        // Compare the hashed OTP with the stored OTP
        if (!compareHash({ plaintext: otp, hashValue: user.otp })) {
            return next(new Error('Invalid or expired OTP.', { cause: 400 }));
        }

        // Check if OTP has expired
        if (user.otpExpire < Date.now()) {
            return next(new Error('OTP expired.', { cause: 400 }));
        }

        // Reactivate the account
        user.deleted = false;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        return successResponse({ res, status: 201, message: 'Account reactivated successfully' });
    }
);

export const resetPassword = asyncHandler(
    async (req, res, next) => {
        const { email, otp, newPassword } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return next(new Error('User not found.', { cause: 404 }));
        }

        // Compare the hashed OTP with the stored OTP
        if (!compareHash({ plaintext: otp, hashValue: user.otp })) {
            return next(new Error('Invalid or expired OTP.', { cause: 400 }));
        }

        // Check if OTP has expired
        if (user.otpExpire < Date.now()) {
            return next(new Error('OTP expired.', { cause: 400 }));
        }

        const hashedPassword = generateHash({ plaintext: newPassword });
        user.password = hashedPassword;
        user.credentialsChangeTime = Date.now();
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        return successResponse({ res, status: 201, message: 'Password reset successfully' });
    }
);


