import mongoose, { model, Schema, Types } from "mongoose";

const messageSchema = new Schema({
    message: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50000
    },
    recepientId: {
        type: Types.ObjectId,
        ref: 'User',
    },
    deleted: {
        type: Boolean,
        default: false
    }, 

}, { timestamps: true });

export const messageModel = mongoose.models.Message || model("Message", messageSchema)