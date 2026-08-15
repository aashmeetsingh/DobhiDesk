const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    unit_price: { type: Number, required: true, min: 0 },
    notes: String,
  },
  { _id: false }
);

const STAGES = ['picked_up', 'washing', 'ironing', 'ready', 'delivered'];

const orderSchema = new mongoose.Schema(
  {
    shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    tag: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending_pickup', 'in_progress', 'ready', 'delivered', 'overdue'],
      default: 'pending_pickup',
    },
    stage: { type: String, enum: STAGES, default: 'picked_up' },
    service_type: { type: String, enum: ['wash', 'iron', 'dry_clean'], required: true },
    pickup_date: Date,
    delivery_date: Date,
    items: [orderItemSchema],
    total_amount: { type: Number, default: 0 },
    payment_status: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

orderSchema.index({ shop_id: 1, tag: 1 }, { unique: true });
orderSchema.index({ shop_id: 1, status: 1 });
orderSchema.index({ shop_id: 1, created_at: -1 });

// Keep total_amount in sync whenever items change
orderSchema.pre('save', function (next) {
  if (this.isModified('items')) {
    this.total_amount = this.items.reduce((sum, i) => sum + i.qty * i.unit_price, 0);
  }
  next();
});

orderSchema.statics.STAGES = STAGES;

module.exports = mongoose.model('Order', orderSchema);
