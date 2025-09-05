import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs-extra";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Path to JSON file
const DATA_FILE = "./messages.json";

// Ensure messages.json exists
fs.ensureFileSync(DATA_FILE);
fs.writeJsonSync(DATA_FILE, [], { spaces: 2, flag: "wx" }, err => {});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => res.send("Backend is live 🚀"));

// Store contact form messages
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const messages = await fs.readJson(DATA_FILE);
    const newMessage = {
      id: messages.length + 1,
      name,
      email,
      message,
      created_at: new Date().toISOString()
    };
    messages.push(newMessage);
    await fs.writeJson(DATA_FILE, messages, { spaces: 2 });
    console.log("✅ Message stored:", newMessage.id);
    res.status(200).json({ message: "Message received!" });
  } catch (err) {
    console.error("❌ File write error:", err);
    res.status(500).json({ message: "Failed to store message" });
  }
});

// View all messages
app.get("/messages", async (req, res) => {
  try {
    const messages = await fs.readJson(DATA_FILE);
    res.status(200).json(messages.reverse());
  } catch (err) {
    console.error("❌ File read error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
