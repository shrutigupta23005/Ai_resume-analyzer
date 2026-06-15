const router = require('express').Router();
const {
  register,
  login,
  getMe,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validateSignup, register);
router.post('/login', authLimiter, validateLogin, login);
router.get('/me', protect, getMe);

router.post("/send-otp",sendOTP);

router.post("/verify-otp",verifyOTP);

router.post("/forgot-password",forgotPassword);

router.post("/reset-password",resetPassword);

module.exports = router;
