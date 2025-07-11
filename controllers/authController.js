import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import {
     sendVerificationEmail,
      sendPasswordResetEmail 
    } from '../modules/email.js';


// REGISTER
export async function register(req, res) {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(409).json({ message: 'Email already in use.' });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(409).json({ message: 'Username already taken.' });

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      username,
      email,
      password,
      verificationToken,
      verificationTokenExpires: Date.now() + 60 * 60 * 1000,
    });

    await user.save();
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: 'Account created. Please verify your email to activate it.'
    });
  } catch (err) {
    console.error('[register ERROR]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// LOGIN
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('[login ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// VERIFY EMAIL
export async function verifyEmail(req, res) {
  const { token } = req.query;

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (err) {
    console.error('[verifyEmail ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// RESEND VERIFICATION EMAIL
export async function resendVerification(req, res) {
  const { email } = req.body;

  try {
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    const token = crypto.randomBytes(32).toString('hex');
    user.verificationToken = token;
    user.verificationTokenExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(user.email, token);
    res.json({ message: 'Verification email resent' });
  } catch (err) {
    console.error('[resendVerification ERROR]', err);
    res.status(500).json({ message: 'Failed to send verification email' });
  }
}

// REQUEST PASSWORD RESET
export async function requestPasswordReset(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    await sendPasswordResetEmail(user.email, token);
    res.json({ message: 'Reset link sent to your email' });
  } catch (err) {
    console.error('[requestPasswordReset ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// RESET PASSWORD
export async function resetPassword(req, res) {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = password;
    user.markModified('password');
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('[resetPassword ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
}
