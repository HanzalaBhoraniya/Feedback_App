import crypto from "crypto"
import {pool} from "../db/index.js"
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { format } from "path";
import jwt from "jsonwebtoken";
dotenv.config();

const sendOTP = async (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(401).json({ message: "Enter an valid email." });
  }
  const expires_at = new Date(Date.now() + 5 * 60 * 1000);
  const randomDigits = crypto.randomInt(100000, 1000000).toString();
  const result = await pool.query(
    "INSERT INTO otps (code, email, expires_at) VALUES ($1, $2, $3)",
    [randomDigits, email, expires_at],
  );
  console.log(randomDigits);
  const transporter = nodemailer.createTransport({
    // Hey Nodemailer, build me a delivery truck that connects to Gmail, and use my secret email and password to log in.
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    // Hey delivery truck, wait right here while you take this specific HTML message, label it from 'Feedback App', and drop it into the user's inbox.
    from: `"Feedback App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Feedback App OTP",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #111;">Login to Feedback App</h2>
          <p>Here is your secure One-Time Password (OTP) to access your dashboard:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 36px; letter-spacing: 8px; color: #6d28d9; margin: 0;">${randomDigits}</h1>
          </div>
          <p style="font-size: 14px; color: #555;">This code will expire in exactly <strong>5 minutes</strong>. For your security, please do not share this code with anyone.</p>
          <p style="font-size: 14px; color: #555;">If you did not request this code, you can safely ignore this email.</p>
          <br>
          <p>Best,<br><strong>The Feedback App Team</strong></p>
        </div>
      `,
  });
  res.status(200).json({
    message: "success, otp has been sent on your email.",
  });
};

const verifyOTP = async (req, res, next) => {
    const { email, code } = req.body; // accessing email and code.
    if (!email || !code) { // checking does it there anything missing?
        return res.status(401).json({ message: "Please enter email and code." })
    }
    // validating for email and code.
    // email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(401).json({message: "Enter an valid email."})
    }
    // validating for code
  const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(code) ) {
        return res.status(401).json({message: "Enter an valid OTP code."})
    }
    // finding opt from the db.
    const result = await pool.query(
        'SELECT * FROM otps WHERE email = $1 AND code = $2',
        [ email, code ]
    )
    if (result.rows.length === 0) { // if we can't get opt in db.
        return res.status(401).json({ message: "Invalid email or code." })
    }
    const otpDetails = result.rows.at(-1) // got the latest otp
    const currTime = Date.now()
    if (currTime > otpDetails.expires_at) { // checking if it is expired. if yes kcick out the user.
        await pool.query(
            'DELETE FROM otps WHERE id = $1',
            [ otpDetails.id ]
        )
        return res.status(401).json({ message: "Code has been expired." })
    }
    // if the otp is correct, delete from db.
    await pool.query(
        'DELETE FROM otps WHERE id = $1',
        [otpDetails.id]
    )
    // cheking that if the userExsist by using email.
    const userExsist = await pool.query(
        'SELECT * FROM owners WHERE email = $1',
        [email]
    )
    let user;
    if (userExsist.rows.length === 0) { // if the user don't exsist we will add them in owners table.
        const insertResult = await pool.query(
            'INSERT INTO owners (email) VALUES ($1) RETURNING *',
            [email]
        )
        user = insertResult.rows[0];
    } else {
        user = userExsist.rows[0]
    }
    // here the process is same for the user who is new and for the who is login for dashboard they will assinged a token we are creating token and sending it back to frontend so we can store in localStorge.
    const userPayload = { 
      id: user.id,
      email: user.email,
    };
    const token = jwt.sign(userPayload, process.env.JWT_SECRET, {expiresIn: "7d"})
    return res.status(200).json({message: "login successfull.", token: token})
}

export {sendOTP, verifyOTP};