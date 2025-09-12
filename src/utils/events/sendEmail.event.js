import { EventEmitter } from "node:events";
export const emailEvent = new EventEmitter();
import { generateEmailTemplate, sendEmail } from "../email/email.js";
import { generateToken } from "../token/token.js";
import userModel from "../../DB/model/User.model.js";
import { generateHash } from "../hash/hash.js";

emailEvent.on("sendEmail", async (data) => {
  const { email } = data;
  const emailToken = generateToken({
    payload: { email },
    signature: process.env.EMAIL_SIGNATURE,
    options: { expiresIn: "2M" },
  });
  const emailLink = `${process.env.FE_URL}/confirmEmail/${emailToken}`;
  const html = generateEmailTemplate(emailLink);
  await sendEmail({ to: email, subject: "Confirm-Email", html });
});

emailEvent.on("sendReactivationOTP", async (data) => {
  const { email } = data;
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
  const hashedOTP = generateHash({ plaintext: otp.toString() });
  const expiry = Date.now() + 2 * 60 * 1000; // 2-M expiration

  // Save OTP and expiration to the user model
  await userModel.updateOne({ email }, { otp: hashedOTP, otpExpire: expiry });

  const html = `Your OTP for reactivating your account is: <b>${otp}</b>. This OTP will expire in 2 minutes.`;
  await sendEmail({ to: email, subject: "Account Re-activation OTP", html });
});

emailEvent.on("sendPasswordOTP", async (data) => {
  const { email } = data;
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
  const hashedOTP = generateHash({ plaintext: otp.toString() });
  const expiry = Date.now() + 2 * 60 * 1000; // 2-M expiration

  // Save OTP and expiration to the user model
  await userModel.updateOne({ email }, { otp: hashedOTP, otpExpire: expiry });

  const html = `Your OTP for resetting your password is: <b>${otp}</b>. This OTP will expire in 2 minutes.`;
  await sendEmail({ to: email, subject: "Verification OTP", html });
});

emailEvent.on("verifyOTP", async (data) => {
  const { email, otp } = data;
  const user = await userModel.findOne({ email });
  if (!user) throw new Error("User not found");

  if (user.otpBannedUntil > Date.now()) {
    throw new Error(
      "You are temporarily banned due to too many failed attempts. Try again later."
    );
  }

  if (!user.otp || user.otpExpire < Date.now()) {
    throw new Error("OTP expired, please request a new one.");
  }

  const isValid = generateHash({ plaintext: otp }) === user.otp;
  if (!isValid) {
    user.otpFailedAttempts += 1;

    
    if (user.otpFailedAttempts >= 5) {
      user.otpBannedUntil = Date.now() + 5 * 60 * 1000;
      user.otpFailedAttempts = 0; // reset counter
    }

    await user.save();
    throw new Error("Invalid OTP");
  }

  user.otp = null;
  user.otpExpire = null;
  user.otpFailedAttempts = 0;
  user.otpBannedUntil = null;
  await user.save();

  return { message: "OTP verified successfully" };
});
