import fs from 'fs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MESSAGES_FILE = './messages.json';

// Helper to read/write JSON file
function readMessages() {
  if (!fs.existsSync(MESSAGES_FILE)) return [];
  return JSON.parse(fs.readFileSync(MESSAGES_FILE));
}
function writeMessages(messages) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

// ------------------- Routes -------------------

// Contact form POST
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ message: 'All fields are required' });

  const messages = readMessages();
  messages.push({ name, email, message, seen: false, timestamp: Date.now() });
  writeMessages(messages);

  res.json({ message: 'Message received!' });
});

// GET all messages
app.get('/messages', (req, res) => {
  const messages = readMessages();
  res.json(messages);
});

// PATCH mark message as seen
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

// DELETE message
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

// Health check
app.get('/', (req, res) => res.send('Backend is live 🚀'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
