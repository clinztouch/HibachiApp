// utils/email.js
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // must be false for TLS over port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // allow self-signed certs (dev)
  },
});

export const sendPasswordResetEmail = async (to, token) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password.html?token=${token}`;
  const message = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Reset Your Password - HibachiApp',
    html: `<p>Click below to reset your password:</p>
           <a href="${resetLink}">${resetLink}</a>
           <p>This link will expire in 1 hour.</p>`
  };
  await transporter.sendMail(message);
};

export const sendVerificationEmail = async (to, token) => {
  const verifyLink = `${process.env.CLIENT_URL}/verify?token=${token}`;
  const message = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Verify your email for HibachiApp',
    html: `<p>Click the link below to verify your email:</p>
           <a href="${verifyLink}">${verifyLink}</a>
           <p>This link expires in 1 hour.</p>`
  };
  await transporter.sendMail(message);
};


