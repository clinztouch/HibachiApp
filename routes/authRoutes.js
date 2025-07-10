import express from 'express';
const router = express.Router();
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  resetPassword
} from '../controllers/authController.js';

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
