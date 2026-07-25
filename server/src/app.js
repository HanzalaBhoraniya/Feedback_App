import { pool } from "./db/index.js";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/authRoutes.js"
import businessRouter from "./routes/businessRoute.js"
import feedbackRouter from './routes/feedbackRoutes.js'
import { findIP } from "./utils/ipAddress.js";

dotenv.config()
const app = express();


// middlewares
app.use(cors({
    origin: [
        "http://localhost:5173", // Allows you to still test on your laptop
        "https://feedback-app-tan-three.vercel.app" // Allows your live Vercel site!
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // means it will also allow to send tokens and all.
}));
app.use(express.json()) // this will help express to understand how to read json objects.
app.use("/api/otp", authRouter)
app.use("/api/businesses", businessRouter)
app.use("/api/feedback", feedbackRouter)

app.use((err, req, res, next) => {
    console.error("🔥 CRITICAL SERVER ERROR:", err);
    
    res.status(500).json({
        status: "error",
        message: "Something went wrong on our end. Please try again later."
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Hey, the server is alive.`)
    console.log(`Test your phone at: http://${findIP()}:1234/`)
});