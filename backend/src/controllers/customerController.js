const Customer = require('../models/Customer');
const Order = require('../models/Order');

exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, shop_id: req.shopId });
    if (!customer) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Customer not found' } });

    const rollup = await Order.aggregate([
      { $match: { customer_id: customer._id } },
      {
        $group: {
          _id: '$customer_id',
          total_orders: { $sum: 1 },
          total_spent: { $sum: '$total_amount' },
          last_visit: { $max: '$created_at' },
        },
      },
    ]);

    res.json({
      ...customer.toObject(),
      total_orders: rollup[0]?.total_orders || 0,
      total_spent: rollup[0]?.total_spent || 0,
      last_visit: rollup[0]?.last_visit || null,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCustomerOrders = async (req, res, next) => {
  try {
    const { page = 1, page_size = 20 } = req.query;
    const orders = await Order.find({ customer_id: req.params.id, shop_id: req.shopId })
      .sort({ created_at: -1 })
      .skip((page - 1) * page_size)
      .limit(Number(page_size));
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const { line1, city, pincode, landmark } = req.body;
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, shop_id: req.shopId },
      { address: { line1, city, pincode, landmark } },
      { new: true }
    );
    res.json(customer);
  } catch (err) {
    next(err);
  }
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const { preferences } = req.body;
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, shop_id: req.shopId },
      { preferences },
      { new: true }
    );
    res.json(customer);
  } catch (err) {
    next(err);
  }
};

exports.searchCustomers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const customers = await Customer.find({
      shop_id: req.shopId,
      $or: [{ name: new RegExp(q, 'i') }, { phone: new RegExp(q, 'i') }],
    }).limit(20);
    res.json(customers);
  } catch (err) {
    next(err);
  }
};
