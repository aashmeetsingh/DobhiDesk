const express = require('express');
const router = express.Router();
const authRequired = require('../middleware/auth');
const ctrl = require('../controllers/customerController');
const paymentCtrl = require('../controllers/paymentController');

router.use(authRequired);

router.get('/search', ctrl.searchCustomers);
router.get('/:id', ctrl.getCustomerById);
router.get('/:id/orders', ctrl.getCustomerOrders);
router.get('/:id/payment-summary', paymentCtrl.getCustomerPaymentSummary);
router.patch('/:id/address', ctrl.updateAddress);
router.patch('/:id/preferences', ctrl.updatePreferences);

module.exports = router;
