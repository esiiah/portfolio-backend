import express from 'express';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// For resolving __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

const MESSAGES_FILE = './messages.json';

// Helpers
function readMessages() {
  if (!fs.existsSync(MESSAGES_FILE)) return [];
  return JSON.parse(fs.readFileSync(MESSAGES_FILE));
}
function writeMessages(messages) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

// Contact form
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ message: 'All fields are required' });

  const messages = readMessages();
  messages.push({ name, email, message, seen: false, timestamp: Date.now() });
  writeMessages(messages);

  res.json({ message: 'Message received!' });
});

// Admin API
app.get('/messages', (req, res) => {
  res.json(readMessages());
});

app.patch('/messages/seen/:index', (req, res) => {
  const messages = readMessages();
  const index = Number(req.params.index);
  if (messages[index]) {
    messages[index].seen = true;
    writeMessages(messages);
    return res.json({ message: 'Marked as seen' });
  }
  res.status(404).json({ message: 'Message not found' });
});

app.delete('/messages/delete/:index', (req, res) => {
  const messages = readMessages();
  const index = Number(req.params.index);
  if (messages[index]) {
    messages.splice(index, 1);
    writeMessages(messages);
    return res.json({ message: 'Message deleted' });
  }
  res.status(404).json({ message: 'Message not found' });
});

// Serve admin.html at /admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
