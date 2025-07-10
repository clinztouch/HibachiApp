// routes/auth.js
import express from 'express';
import User from '../models/User.js';
import { generateVerificationToken } from '../utils/token.js';
import { sendVerificationEmail } from '../utils/email.js';

const router = express.Router();

router.post('/resend', async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const token = generateVerificationToken(user._id);
    await sendVerificationEmail(email, token);

    res.json({ message: 'Verification email resent' });
  } catch (err) {
    console.error('[resend ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
