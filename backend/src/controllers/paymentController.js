const mongoose = require('mongoose');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

async function computeBalance(orderId) {
  const order = await Order.findById(orderId);
  const paidAgg = await Payment.aggregate([
    { $match: { order_id: order._id } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const paid = paidAgg[0]?.total || 0;
  return order.total_amount - paid;
}

exports.getInvoice = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, shop_id: req.shopId });
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });

    const paidAgg = await Payment.aggregate([
      { $match: { order_id: order._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const advance = paidAgg[0]?.total || 0;

    res.json({ total: order.total_amount, advance, balance: order.total_amount - advance, items: order.items });
  } catch (err) {
    next(err);
  }
};

exports.recordPayment = async (req, res, next) => {
  try {
    const { amount, method } = req.body;

    const order = await Order.findOne({ _id: req.params.id, shop_id: req.shopId });
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });

    await Payment.create({
      shop_id: req.shopId,
      order_id: order._id,
      customer_id: order.customer_id,
      amount,
      method,
      paid_at: new Date()
    });

    const balance = await computeBalance(order._id);
    order.payment_status = balance <= 0 ? 'paid' : 'partial';
    await order.save();

    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.markAsPaid = async (req, res, next) => {
  try {
    const { method } = req.body;

    const order = await Order.findOne({ _id: req.params.id, shop_id: req.shopId });
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });

    const balance = await computeBalance(order._id);
    if (balance > 0) {
      await Payment.create({
        shop_id: req.shopId,
        order_id: order._id,
        customer_id: order.customer_id,
        amount: balance,
        method,
        paid_at: new Date()
      });
    }

    order.payment_status = 'paid';
    await order.save();

    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.getCustomerPaymentSummary = async (req, res, next) => {
  try {
    const summary = await Order.aggregate([
      { $match: { customer_id: new mongoose.Types.ObjectId(req.params.id) } },
      { $group: { _id: null, total_spent: { $sum: '$total_amount' }, total_orders: { $sum: 1 } } },
    ]);
    res.json({ total_spent: summary[0]?.total_spent || 0, total_orders: summary[0]?.total_orders || 0 });
  } catch (err) {
    next(err);
  }
};
