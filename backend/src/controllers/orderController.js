const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const generateTag = require('../utils/generateTag');

function startOfWeek() {
  const d = new Date();
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const shopId = req.shopId;
    const weekStart = startOfWeek();
    const monthStart = startOfMonth();

    const [totalOrdersThisWeek, overdueOrders, completedThisWeek, revenueAgg] = await Promise.all([
      Order.countDocuments({ shop_id: shopId, created_at: { $gte: weekStart } }),
      Order.countDocuments({ shop_id: shopId, status: 'pending_pickup', pickup_date: { $lt: new Date() } }),
      Order.countDocuments({ shop_id: shopId, status: 'delivered', updated_at: { $gte: weekStart } }),
      Payment.aggregate([
        { $match: { shop_id: shopId, paid_at: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({
      total_orders_this_week: totalOrdersThisWeek,
      revenue_this_month: revenueAgg[0]?.total || 0,
      overdue_orders: overdueOrders,
      completed_this_week: completedThisWeek,
    });
  } catch (err) {
    next(err);
  }
};

exports.getRecentActivity = async (req, res, next) => {
  try {
    const orders = await Order.find({ shop_id: req.shopId })
      .sort({ updated_at: -1 })
      .limit(5)
      .populate('customer_id', 'name phone');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { customer_name, phone, pickup_date, delivery_date, service_type, items, customer_id } = req.body;
    const shopId = req.shopId;

    let customer;
    if (customer_id) {
      customer = await Customer.findOne({ shop_id: shopId, _id: customer_id });
    }
    if (!customer) {
      customer = await Customer.findOne({ shop_id: shopId, phone });
    }
    if (!customer) {
      customer = await Customer.create({ shop_id: shopId, name: customer_name, phone });
    }

    const tag = await generateTag(shopId);

    const order = await Order.create({
      shop_id: shopId,
      customer_id: customer._id,
      tag,
      status: 'pending_pickup',
      stage: 'picked_up',
      service_type,
      pickup_date,
      delivery_date,
      items,
    });

    res.status(201).json({ order, tag });
  } catch (err) {
    next(err);
  }
};

exports.listOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, page_size = 20 } = req.query;
    const filter = { shop_id: req.shopId };
    if (status && status !== 'all') filter.status = status;

    let query = Order.find(filter);

    if (search) {
      // Search by tag directly, or by customer name/phone via a lookup
      const matchingCustomers = await Customer.find({
        shop_id: req.shopId,
        $or: [{ name: new RegExp(search, 'i') }, { phone: new RegExp(search, 'i') }],
      }).select('_id');

      query = Order.find({
        shop_id: req.shopId,
        ...(status && status !== 'all' ? { status } : {}),
        $or: [
          { tag: new RegExp(search, 'i') },
          { customer_id: { $in: matchingCustomers.map((c) => c._id) } },
        ],
      });
    }

    const orders = await query
      .sort({ created_at: -1 })
      .skip((page - 1) * page_size)
      .limit(Number(page_size))
      .populate('customer_id', 'name phone');

    const total = await Order.countDocuments(filter);

    res.json({ data: orders, page: Number(page), page_size: Number(page_size), total });
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, shop_id: req.shopId }).populate('customer_id');
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });

    const advance = await require('../models/Payment').aggregate([
      { $match: { order_id: order._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const advancePaid = advance[0]?.total || 0;

    res.json({
      ...order.toObject(),
      payment_summary: {
        total: order.total_amount,
        advance_paid: advancePaid,
        balance: order.total_amount - advancePaid,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.advanceStage = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, shop_id: req.shopId });
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });

    const stages = Order.STAGES;
    const nextIndex = stages.indexOf(order.stage) + 1;
    if (nextIndex >= stages.length) {
      return res.status(400).json({ error: { code: 'FINAL_STAGE', message: 'Order already at final stage' } });
    }

    order.stage = stages[nextIndex];
    order.status = order.stage === 'delivered' ? 'delivered' : order.stage === 'ready' ? 'ready' : 'in_progress';
    await order.save();

    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.updateOrder = async (req, res, next) => {
  try {
    const allowedFields = ['pickup_date', 'delivery_date', 'items', 'service_type'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const order = await Order.findOne({ _id: req.params.id, shop_id: req.shopId });
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });

    Object.assign(order, updates);
    await order.save(); // triggers total_amount recalculation if items changed

    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.getPeakHoursInsight = async (req, res, next) => {
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const buckets = await Order.aggregate([
      { $match: { shop_id: req.shopId, created_at: { $gte: ninetyDaysAgo } } },
      { $group: { _id: { $hour: '$created_at' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    if (!buckets.length) return res.json({ peak_hour: null, message: 'Not enough data yet' });

    const hour = buckets[0]._id;
    res.json({
      peak_hour: hour,
      message: `Your facility is most active around ${hour}:00. Consider allocating more staff during this window.`,
    });
  } catch (err) {
    next(err);
  }
};