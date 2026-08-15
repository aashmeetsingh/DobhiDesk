const Order = require('../models/Order');

// Generates the next sequential tag for a shop, e.g. "A-119".
// Simple approach: count existing orders for the shop + 1.
// Fine for a single shop's order volume; if you need strict uniqueness
// under concurrent writes later, switch to a per-shop counter document.
async function generateTag(shopId) {
  const count = await Order.countDocuments({ shop_id: shopId });
  const nextNumber = count + 101; // start numbering at 101, matches wireframe style
  return `A-${nextNumber}`;
}

module.exports = generateTag;
