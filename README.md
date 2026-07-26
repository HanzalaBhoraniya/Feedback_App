# 🚀 Feedback SaaS Platform

> A full-stack, production-ready B2B platform that allows business owners to collect, analyze, and manage customer feedback in real-time.

## 🌐 Live Demo
[**View the Live Project Here**](https://feedback-app-tan-three.vercel.app)

## 📖 About This Project
This application was built to solve a real-world business problem: gathering and analyzing customer sentiment effortlessly. Business owners can create a custom profile, generate unique QR codes or shareable links, and track their Net Promoter Score (NPS) and average ratings through an interactive analytics dashboard. 

## 🛠️ Tech Stack
**Frontend:**
* React.js (Vite)
* React Router DOM (Protected & Public Routing)
* Recharts (Data Visualization)
* Vanilla CSS (Fully custom responsive styling)

**Backend:**
* Node.js & Express.js
* PostgreSQL (Hosted on Neon)
* JSON Web Tokens (JWT) for secure authentication
* Cloudinary API (Image hosting & processing)
* Brevo HTTP API (Custom SMTP email delivery)

## ✨ Key Features
* **Secure OTP Authentication:** Passwordless login system using custom-branded emails delivered via Brevo.
* **Complex Data Aggregation:** Advanced SQL queries to calculate live Net Promoter Scores (NPS), average ratings, and trend lines over time.
* **Dynamic Sharing Console:** Auto-generates downloadable QR codes and shareable links specific to each business profile.
* **Bulletproof Architecture:** Database-level constraints (One-to-One relationships) and strict backend validation to prevent duplicate accounts and spam.
* **Role-Based Access Control:** Protected React routes that verify JWT clearance before rendering dashboards or settings.

## 💻 Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/HanzalaBhoraniya/Feedback_App.git
   ```

2. **Install dependencies for both client and server:**
   ```bash
   cd Feedback_App/client
   npm install
   
   cd ../server
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the `server` directory and add your keys:
   ```env
   DATABASE_URL=your_neon_postgres_url
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   BREVO_API_KEY=your_brevo_key
   EMAIL_USER=your_verified_email
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the Development Servers:**
   ```bash
   # Terminal 1 (Backend)
   cd server
   npm run dev
   
   # Terminal 2 (Frontend)
   cd client
   npm run dev
   ```f
