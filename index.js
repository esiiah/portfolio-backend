// index.js
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("Backend is live 🚀");
});

// Contact form route
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Gmail transporter with App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Prepare email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_FROM, // send to yourself
      replyTo: email, // original sender for reply
      subject: `Portfolio Contact Form: ${name}`,
      text: message,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", info.messageId);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("❌ Full Email send error:", error);
    res.status(500).json({
      message: "Failed to send email. Please try again later.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
