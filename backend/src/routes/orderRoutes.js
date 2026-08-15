const express = require('express');
const router = express.Router();
const authRequired = require('../middleware/auth');
const ctrl = require('../controllers/orderController');
const paymentCtrl = require('../controllers/paymentController');

router.use(authRequired);

router.get('/dashboard/summary', ctrl.getDashboardSummary);
router.get('/recent-activity', ctrl.getRecentActivity);
router.get('/insights/peak-hours', ctrl.getPeakHoursInsight);

router.post('/', ctrl.createOrder);
router.get('/', ctrl.listOrders);
router.get('/:id', ctrl.getOrderById);
router.patch('/:id', ctrl.updateOrder);
router.patch('/:id/stage', ctrl.advanceStage);

router.get('/:id/invoice', paymentCtrl.getInvoice);
router.post('/:id/payments', paymentCtrl.recordPayment);
router.patch('/:id/mark-paid', paymentCtrl.markAsPaid);

module.exports = router;
