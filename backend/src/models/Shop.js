const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' }, 
    phone: { type: String, required: true, unique: true },
    address: {
      line1: String,
      city: String,
      pincode: String,
    },
    settings: {
      overdue_reminders: { type: Boolean, default: true },
      daily_summary_notification: { type: Boolean, default: false },
      auto_assign_tag_numbers: { type: Boolean, default: true },
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Shop', shopSchema);