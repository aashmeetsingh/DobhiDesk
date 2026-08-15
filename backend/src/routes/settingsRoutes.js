const express = require('express');
const router = express.Router();
const authRequired = require('../middleware/auth');
const ctrl = require('../controllers/settingsController');

router.use(authRequired);

router.get('/', ctrl.getSettings);
router.patch('/', ctrl.updateSettings);
router.get('/export/orders.csv', ctrl.exportOrdersCsv);
router.get('/export/orders.pdf', ctrl.exportOrdersPdf);

module.exports = router;