const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      line1: String,
      city: String,
      pincode: String,
      landmark: String,
    },
    preferences: [{ type: String }],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

customerSchema.index({ shop_id: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
