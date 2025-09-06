import { roleTypes } from "../../middleware/auth.middleware.js"

export const endpoint = {
    profile: Object.values(roleTypes),
    deleteMessage: [roleTypes.User]
}