import express from "express";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verifyUser from "../../middleware/verifyUser.js";

import User from "../../models/user.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // console.log(username, email, password);
    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //checking username is already there or not
    const checkUsername = await User.findOne({ username });
    if (checkUsername) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    //make the password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      email,
      username,
      password: hashedPassword,
    });

    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Password not matched" });
    }

    const payload = {
      username: user.username,
      userId: user._id,
      email: email,
    };

    const token = jwt.sign(payload, "this_is_my_secretKey", {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,  // true -for production
      sameSite: "none",  // none -for production
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "User login successfully" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/verifyEmail", async (req, res) => {
  try {
    const email = req.query.email;

    //checking email is already there or not
    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    //to generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log(otp);

    //creating the transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "akashhowly463@gmail.com",
        pass: process.env.EMAIL_PASS,
      },
    });

   const info = await transporter.sendMail({
  from: '"Welcome to Zynk" <akashhowly463@gmail.com>',
  to: email,
  subject: "Verify Your Email - OTP Code",
  text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
  html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">

            <h2 style="color: #333; text-align: center;">Zynk Email Verification</h2>

            <p style="color: #555; font-size: 14px;">
                Hi,
            </p>

            <p style="color: #555; font-size: 14px;">
                Welcome to <strong>Zynk</strong> — your chat space to connect and communicate in real time.
                Use the One-Time Password (OTP) below to verify your email and get started.
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; padding: 15px 25px; font-size: 24px; letter-spacing: 4px; font-weight: bold; color: #ffffff; background-color: #4f46e5; border-radius: 8px;">
                    ${otp}
                </span>
            </div>

            <p style="color: #555; font-size: 14px;">
                This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.
            </p>

            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                If you didn’t request this, you can safely ignore this email.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="color: #aaa; font-size: 12px; text-align: center;">
                © 2026 Zynk Chat App. All rights reserved.
            </p>
        </div>
    </div>
  `,
});

    console.log("Message sent:", info.messageId);

    return res.status(200).json({ mssage: "OTP sent", OTP: otp });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ mssage: "Internal Server Error" });
  }
});

router.get("/verify", verifyUser, async (req, res) => {
  return res.status(200).json({
    message: "Success",
    username: req.username,
    userId: req.userId,
    email: req.email,
  });
});

router.delete("/signout", async (req, res) => {
  try {
    // const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, //secure: isProduction,
      sameSite: "lax", //sameSite: isProduction ? "none" : "lax",
    });
    return res.status(200).json({ message: "Successfully Sign Out" });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Can't delete JWT token!" });
  }
});

export default router;
