import { EventEmitter } from "node:events";
export const emailEvent = new EventEmitter();
import { generateEmailTemplate, sendEmail } from "../email/email.js";
import { generateToken } from "../token/token.js";
import userModel from "../../DB/model/User.model.js";
import { generateHash } from "../hash/hash.js";


emailEvent.on('sendEmail', async (data) => {
    const { email } = data;
    const emailToken = generateToken({
        payload: { email },
        signature: process.env.EMAIL_SIGNATURE,
        options: { expiresIn: '1h' }
    })
    const emailLink = `${process.env.FE_URL}/confirmEmail/${emailToken}`;
    const html = generateEmailTemplate(emailLink);
    await sendEmail({ to: email, subject: "Confirm-Email", html });
});

emailEvent.on('sendReactivationOTP', async (data) => {
    const { email } = data;
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    const hashedOTP = generateHash({ plaintext: otp.toString() })
    const expiry = Date.now() + 3600000; // 1-hour expiration

    // Save OTP and expiration to the user model 
    await userModel.updateOne({ email }, { otp: hashedOTP, otpExpire: expiry });

    const html = `Your OTP for reactivating your account is: <b>${otp}</b>. This OTP will expire in 1 hour.`;
    await sendEmail({ to: email, subject: "Account Re-activation OTP", html });
});

emailEvent.on('sendPasswordOTP', async (data) => {
    const { email } = data;
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    const hashedOTP = generateHash({ plaintext: otp.toString() })
    const expiry = Date.now() + 3600000; // 1-hour expiration

    // Save OTP and expiration to the user model 
    await userModel.updateOne({ email }, { otp: hashedOTP, otpExpire: expiry });

    const html = `Your OTP for resetting your password is: <b>${otp}</b>. This OTP will expire in 1 hour.`;
    await sendEmail({ to: email, subject: "Verification OTP", html });
});