const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['cash', 'upi', 'card'], required: true },
    paid_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Payment', paymentSchema);
