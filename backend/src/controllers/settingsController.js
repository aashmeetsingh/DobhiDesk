const Shop = require('../models/Shop');
const Order = require('../models/Order');
const PDFDocument = require('pdfkit');

exports.getSettings = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.shopId);
    res.json(shop.settings);
  } catch (err) {
    next(err);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { overdue_reminders, daily_summary_notification, auto_assign_tag_numbers } = req.body;
    const updates = {};
    if (overdue_reminders !== undefined) updates['settings.overdue_reminders'] = overdue_reminders;
    if (daily_summary_notification !== undefined) updates['settings.daily_summary_notification'] = daily_summary_notification;
    if (auto_assign_tag_numbers !== undefined) updates['settings.auto_assign_tag_numbers'] = auto_assign_tag_numbers;

    const shop = await Shop.findByIdAndUpdate(req.shopId, { $set: updates }, { new: true });
    res.json(shop.settings);
  } catch (err) {
    next(err);
  }
};

exports.exportOrdersCsv = async (req, res, next) => {
  try {
    const orders = await Order.find({ shop_id: req.shopId }).populate('customer_id', 'name phone');

    const header = 'Tag,Customer,Phone,Status,Stage,Total Amount,Payment Status,Created At\n';
    const rows = orders
      .map((o) =>
        [o.tag, o.customer_id?.name, o.customer_id?.phone, o.status, o.stage, o.total_amount, o.payment_status, o.created_at.toISOString()].join(',')
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    res.send(header + rows);
  } catch (err) {
    next(err);
  }
};

exports.exportOrdersPdf = async (req, res, next) => {
  try {
    const [shop, orders] = await Promise.all([
      Shop.findById(req.shopId),
      Order.find({ shop_id: req.shopId }).sort({ created_at: -1 }).populate('customer_id', 'name phone'),
    ]);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="orders-report.pdf"');

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(res);

    // Header
    doc.fontSize(18).fillColor('#0F172A').text(shop?.name || 'LaundryTrack', { continued: false });
    doc.fontSize(11).fillColor('#64748B').text('Orders report');
    doc.fontSize(9).fillColor('#94A3B8').text(`Generated ${new Date().toLocaleString()}  •  ${orders.length} orders`);
    doc.moveDown(1.2);

    // Table setup
    const startX = doc.page.margins.left;
    const colWidths = [65, 110, 85, 75, 65, 70]; // Tag, Customer, Phone, Status, Amount, Payment
    const headers = ['Tag', 'Customer', 'Phone', 'Status', 'Amount', 'Payment'];
    const rowHeight = 20;
    const bottomLimit = doc.page.height - doc.page.margins.bottom;
    let y = doc.y;

    function drawRow(cells, opts = {}) {
      const { header = false } = opts;
      doc.fontSize(9).fillColor(header ? '#0F172A' : '#1E293B');
      doc.font(header ? 'Helvetica-Bold' : 'Helvetica');
      let x = startX;
      cells.forEach((text, i) => {
        doc.text(String(text ?? '-'), x, y, { width: colWidths[i], ellipsis: true });
        x += colWidths[i];
      });
      y += rowHeight;

      if (y > bottomLimit) {
        doc.addPage();
        y = doc.page.margins.top;
      }
    }

    drawRow(headers, { header: true });
    doc
      .moveTo(startX, y - 4)
      .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y - 4)
      .strokeColor('#E2E8F0')
      .stroke();

    orders.forEach((o) => {
      drawRow([
        o.tag,
        o.customer_id?.name || '-',
        o.customer_id?.phone || '-',
        o.status,
        `Rs ${o.total_amount}`, // avoid the ₹ glyph — pdfkit's built-in font doesn't include it
        o.payment_status,
      ]);
    });

    if (orders.length === 0) {
      doc.fontSize(10).fillColor('#94A3B8').text('No orders yet.', startX, y);
    }

    doc.end();
  } catch (err) {
    next(err);
  }
};