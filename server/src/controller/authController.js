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
  // --- BREVO HTTP API INTEGRATION ---
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "Feedback App",
        email: process.env.EMAIL_USER,
      },
      to: [{ email: email }],
      subject: "Your Feedback App OTP",
      htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; text-align: center;">
            <img src="https://feedback-app-tan-three.vercel.app/your-logo.png" alt="Feedback App Logo" style="width: 80px; height: 80px; margin-bottom: 20px; border-radius: 10px;">
            <h2 style="color: #111;">Login to Feedback App</h2>
            <p style="text-align: left;">Here is your secure One-Time Password (OTP) to access your dashboard:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h1 style="font-size: 36px; letter-spacing: 8px; color: #6d28d9; margin: 0;">${randomDigits}</h1>
            </div>
            <p style="font-size: 14px; color: #555; text-align: left;">This code will expire in exactly <strong>5 minutes</strong>. For your security, please do not share this code with anyone.</p>
            <br>
            <p style="text-align: left;">Best,<br><strong>The Feedback App Team</strong></p>
          </div>
        `,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Brevo API Error:", errorData);
    return res.status(500).json({ message: "Failed to send email." });
  }
  res.status(200).json({
    message: "success, otp has been sent on your email.",
  });
};;

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