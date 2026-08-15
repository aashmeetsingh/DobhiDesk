const jwt = require('jsonwebtoken');
const Shop = require('../models/Shop');
const otpStore = require('../utils/otpStore');
const { sendOtp } = require('../utils/sms');

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

exports.sendOtpHandler = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'phone is required' } });

    const otp = generateOtp();
    otpStore.save(phone, otp);
    await sendOtp(phone, otp);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.verifyOtpHandler = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'phone and otp are required' } });
    }

    const isValid = otpStore.verify(phone, otp);
    if (!isValid) {
      return res.status(401).json({ error: { code: 'INVALID_OTP', message: 'OTP is invalid or expired' } });
    }

    let shop = await Shop.findOne({ phone });
    if (!shop) {
      shop = await Shop.create({ phone, name: '' }); // name filled in during shop-setup step
    }

    const token = jwt.sign({ shop_id: shop._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, shop });
  } catch (err) {
    next(err);
  }
};

exports.shopSetupHandler = async (req, res, next) => {
  try {
    const { shop_name } = req.body;
    const shop = await Shop.findByIdAndUpdate(req.shopId, { name: shop_name }, { new: true });
    res.json({ shop });
  } catch (err) {
    next(err);
  }
};
