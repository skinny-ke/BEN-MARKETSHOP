const express = require('express');
const router = express.Router();
const { clerkAuth, requireAdmin } = require('../middleware/clerkAuth');
const {
  getInventoryDashboard,
  updateStock,
  getInventoryLogs,
  getSuppliers,
  createSupplier,
  getPurchaseOrders,
  createPurchaseOrder,
  acknowledgeAlert
} = require('../Controllers/inventoryController');

// ✅ Get inventory dashboard (admin only)
router.get('/dashboard', clerkAuth, requireAdmin, getInventoryDashboard);

// ✅ Update product stock (admin only)
router.post('/stock', clerkAuth, requireAdmin, updateStock);

// ✅ Get inventory logs (admin only)
router.get('/logs', clerkAuth, requireAdmin, getInventoryLogs);

// ✅ Suppliers management (admin only)
router.get('/suppliers', clerkAuth, requireAdmin, getSuppliers);
router.post('/suppliers', clerkAuth, requireAdmin, createSupplier);

// ✅ Purchase orders management (admin only)
router.get('/purchase-orders', clerkAuth, requireAdmin, getPurchaseOrders);
router.post('/purchase-orders', clerkAuth, requireAdmin, createPurchaseOrder);

// ✅ Acknowledge inventory alert (admin only)
router.post('/alerts/:alertId/acknowledge', clerkAuth, requireAdmin, acknowledgeAlert);

module.exports = router;