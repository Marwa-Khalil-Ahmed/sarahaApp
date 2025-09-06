import userModel from "../DB/model/User.model.js";
import { asyncHandler } from "../utils/error/error.handling.js";
import { verifyToken } from "../utils/token/token.js";

export const roleTypes = {
    User: "User",
    Admin: "Admin"
};

export const authentication = () => {
    return asyncHandler(
        async (req, res, next) => {
            const { authorization } = req.headers;
            if (!authorization) {
                return next(new Error("Authorization is required", { cause: 400 }))
            };

            const [Bearer, token] = authorization.split(" ");
            if (!Bearer || !token) {
                return next(new Error("Authorization is required", { cause: 400 }))
            };

            let TOKEN_SIGNATURE = undefined;
            switch (Bearer) {
                case "Bearer":
                    TOKEN_SIGNATURE = process.env.TOKEN_SIGNATURE;
                    break;
                case "Admin":
                    TOKEN_SIGNATURE = process.env.TOKEN_SIGNATURE_ADMIN;
                    break;
                default:
                    break;

            }

            const decoded = verifyToken({ token, TOKEN_SIGNATURE });
            if (!decoded?.id) {
                return next(new Error("Invalid Token Payload", { cause: 400 }));
            }

            const user = await userModel.findById(decoded.id);
            if (!user) {
                return next(new Error("Not Registered Account", { cause: 403 }));
            };

            if (user.credentialsChangeTime?.getTime() >= (decoded.iat * 1000)) {
                return next(new Error("Expired Credentials, please login again", { cause: 403 }));
            }

            req.user = user;
            return next();
        })
}

export const authorization = (accessRoles = []) => {
    return asyncHandler(
        async (req, res, next) => {
            if (!accessRoles.includes(req.user.role)) {
                return next(new Error("Not Authorized Account", { cause: 403 }));
            }
            return next();
        }
    )
}