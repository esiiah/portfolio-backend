// index.js
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Backend is live 🚀");
});

app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true,
      debug: true,
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_FROM,
      replyTo: email,
      subject: `Portfolio Contact Form: ${name}`,
      text: message,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", info.messageId);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    // Print full error in Railway logs
    console.error("❌ FULL EMAIL ERROR:", error);

    // Send generic error to client
    res.status(500).json({
      message: "Failed to send email. Please check logs.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
