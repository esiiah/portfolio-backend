// index.js
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route for health check
app.get('/', (req, res) => {
  res.send('Backend is live 🚀');
});

// POST route for contact form
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Nodemailer transporter using Gmail App Password
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,       // smtp.gmail.com
      port: Number(process.env.EMAIL_PORT),// 465
      secure: process.env.EMAIL_PORT == 465, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // verify SMTP connection before sending
    await transporter.verify();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_FROM, // send to yourself
      replyTo: email,              // sender's email for reply
      subject: `Portfolio Contact Form: ${name}`,
      text: message,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", info.messageId);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error("❌ Email send error:", error);
    res.status(500).json({ message: error.message || 'Something went wrong' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
