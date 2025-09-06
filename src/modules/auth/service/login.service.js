import userModel from "../../../DB/model/User.model.js";
import { asyncHandler } from "../../../utils/error/error.handling.js";
import { roleTypes } from "../../../middleware/auth.middleware.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { generateToken } from "../../../utils/token/token.js";
import { compareHash } from "../../../utils/hash/hash.js";



export const login = asyncHandler(
    async (req, res, next) => {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return next(new Error("In-valid account", { cause: 404 }));
        }

        if (!user.confirmEmail) {
            return next(new Error("Please Confirm Your Email First", { cause: 400 }));
        }

        const match = compareHash({ plaintext: password, hashValue: user.password });
        if (!match) {
            return next(new Error("In-valid login credentials", { cause: 404 }));
        }

        if (user.deleted) {
            return next(new Error("Your account has been frozen, please re-activate it first", { cause: 404 }));
        }


        const token = generateToken({
            payload: { id: user._id, isLoggedIn: true },
            signature: user.role == roleTypes.User ? process.env.TOKEN_SIGNATURE : process.env.TOKEN_SIGNATURE_ADMIN,
            options: { expiresIn: '1h' }
        })

        return successResponse({ res, data: { token } });
    }
)