import { messageModel } from "../../../DB/model/Message.model.js";
import userModel from "../../../DB/model/User.model.js";
import { asyncHandler } from "../../../utils/error/error.handling.js";
import { successResponse } from "../../../utils/response/success.response.js";

export const sendMessage = asyncHandler(
    async (req, res, next) => {
        const { message, recepientId } = req.body;
        const user = await userModel.findOne({ _id: recepientId, deleted: false });
        if (!user) {
            return next(new Error("In-valid Recepient", { cause: 404 }))
        }
        const newMessage = await messageModel.create({ message, recepientId });
        return successResponse({ res, status: 201, message: "Message sent successfully" });
    }
)

//soft delete
export const deleteMessage = asyncHandler(
    async (req, res, next) => {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await messageModel.findOne({ _id: messageId, deleted: false });
        if (!message) {
            return next(new Error("Message not found.", { cause: 404 }));
        }

        if (message.recepientId.toString() !== userId.toString()) {
            return next(new Error("Unauthorized User.", { cause: 403 }));
        }

        // Mark the message as deleted
        message.deleted = true;
        await message.save();

        return successResponse({ res, message: "Message deleted successfully" });
    }
);
