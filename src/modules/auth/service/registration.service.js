import userModel from "../../../DB/model/User.model.js";
import { emailEvent } from "../../../utils/events/sendEmail.event.js";
import { asyncHandler } from "../../../utils/error/error.handling.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { verifyToken } from "../../../utils/token/token.js";
import { generateHash } from "../../../utils/hash/hash.js";
import { generateEncryption } from "../../../utils/hash/encryption.js";






export const signup = asyncHandler(
    async (req, res, next) => {
        const { userName, email, password, confirmPassword, phone } = req.body;

        if (password !== confirmPassword) {
            return next(new Error("Password and password confirmation mismatch", { cause: 400 }));
        }

        if (await userModel.findOne({ email })) {
            return next(new Error("Email already exists", { cause: 409 }));
        }

        const encPhone = generateEncryption({ plaintext: phone });
        const hashPassword = generateHash({ plaintext: password });

        const { _id } = await userModel.create({ userName, email, password: hashPassword, phone: encPhone });
        emailEvent.emit("sendEmail", { email });

        return successResponse({ res, message: "User Successfully Added", status: 201, data: { user: _id } })
    }
)

export const confirmEmail = asyncHandler(
    async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization) {
            return next(new Error("Authorization header is missing", { cause: 400 }));
        }

        const { email } = verifyToken({
            token: authorization,
            signature: process.env.EMAIL_SIGNATURE,
        });

        const user = await userModel.findOneAndUpdate({ email }, { confirmEmail: true });
        if (!user) {
            return next(new Error("User not found", { cause: 404 }));
        }

        return successResponse({ res, data: { user } });
    }
)




