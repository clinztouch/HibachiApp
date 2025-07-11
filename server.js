import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import { sendVerificationEmail } from './utils/emailTemplates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend'))); 
// API routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);

// Serve frontend pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html')); 
});

app.get('/verify', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'verify.html')); 
});

// Dev/test email route
app.get('/test-email', async (req, res) => {
  try {
    await sendVerificationEmail('iordyecalvin@gmail.com', 'test-token-123');
    res.send('✅ Test email sent!');
  } catch (err) {
    console.error(' Failed to send test email:', err);
    res.status(500).send(' Failed to send email');
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Trust proxy in production (for HTTPS cookies, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
