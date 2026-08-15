const express = require('express');
const router = express.Router();
const authRequired = require('../middleware/auth');
const { sendOtpHandler, verifyOtpHandler, shopSetupHandler } = require('../controllers/authController');

router.post('/otp/send', sendOtpHandler);
router.post('/otp/verify', verifyOtpHandler);
router.post('/shop-setup', authRequired, shopSetupHandler);

module.exports = router;
