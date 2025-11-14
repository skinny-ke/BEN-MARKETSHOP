const { InventoryLog, InventoryAlert, Supplier, PurchaseOrder } = require('../Models/Inventory');
const Product = require('../Models/Product');

// ✅ Get inventory dashboard data
const getInventoryDashboard = async (req, res) => {
  try {
    const [
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      recentLogs,
      activeAlerts,
      suppliers
    ] = await Promise.all([
      Product.countDocuments(),
      Product.find({ stock: { $gt: 0, $lte: 10 } }).select('name stock'),
      Product.find({ stock: 0 }).select('name stock'),
      InventoryLog.find().sort({ createdAt: -1 }).limit(10).populate('productId', 'name'),
      InventoryAlert.find({ isActive: true }).populate('productId', 'name'),
      Supplier.find({ isActive: true }).select('name contactPerson')
    ]);

    // Calculate inventory value
    const products = await Product.find().select('stock cost');
    const totalValue = products.reduce((sum, product) => {
      return sum + (product.stock * (product.cost || 0));
    }, 0);

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
          totalValue,
          activeAlerts: activeAlerts.length
        },
        lowStockProducts,
        outOfStockProducts,
        recentLogs,
        activeAlerts,
        suppliers
      }
    });
  } catch (error) {
    console.error('Error fetching inventory dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory dashboard' });
  }
};

// ✅ Update product stock with logging
const updateStock = async (req, res) => {
  try {
    const { productId, quantity, type, reason, reference, cost, notes } = req.body;
    const performedBy = req.auth?.userId || req.user?.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const previousStock = product.stock;
    let newStock = previousStock;

    switch (type) {
      case 'stock_in':
        newStock = previousStock + quantity;
        break;
      case 'stock_out':
        newStock = Math.max(0, previousStock - quantity);
        break;
      case 'adjustment':
        newStock = quantity; // Direct set
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid stock update type' });
    }

    // Update product stock
    product.stock = newStock;
    await product.save();

    // Create inventory log
    const log = new InventoryLog({
      productId,
      type,
      quantity,
      previousStock,
      newStock,
      reason,
      reference,
      performedBy,
      cost: cost || 0,
      notes: notes || ''
    });
    await log.save();

    // Check for alerts
    await checkInventoryAlerts(productId, newStock);

    res.json({
      success: true,
      data: {
        product: { _id: product._id, name: product.name, stock: product.stock },
        log
      },
      message: 'Stock updated successfully'
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ success: false, message: 'Failed to update stock' });
  }
};

// ✅ Get inventory logs
const getInventoryLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const productId = req.query.productId;
    const type = req.query.type;

    let query = {};
    if (productId) query.productId = productId;
    if (type) query.type = type;

    const logs = await InventoryLog.find(query)
      .populate('productId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await InventoryLog.countDocuments(query);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching inventory logs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory logs' });
  }
};

// ✅ Manage suppliers
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json({ success: true, data: suppliers });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch suppliers' });
  }
};

const createSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json({ success: true, data: supplier, message: 'Supplier created successfully' });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ success: false, message: 'Failed to create supplier' });
  }
};

// ✅ Manage purchase orders
const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate('supplierId', 'name')
      .populate('items.productId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch purchase orders' });
  }
};

const createPurchaseOrder = async (req, res) => {
  try {
    const { supplierId, items, expectedDelivery, notes } = req.body;
    const createdBy = req.auth?.userId || req.user?.id;

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.totalCost, 0);

    const order = new PurchaseOrder({
      supplierId,
      items,
      totalAmount,
      expectedDelivery,
      notes,
      createdBy
    });

    await order.save();
    await order.populate(['supplierId', 'items.productId']);

    res.status(201).json({
      success: true,
      data: order,
      message: 'Purchase order created successfully'
    });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ success: false, message: 'Failed to create purchase order' });
  }
};

// ✅ Helper function to check and create inventory alerts
const checkInventoryAlerts = async (productId, currentStock) => {
  try {
    const product = await Product.findById(productId).select('name stock lowStockThreshold');

    // Remove existing alerts for this product
    await InventoryAlert.deleteMany({ productId, isActive: true });

    const alerts = [];

    // Low stock alert
    if (currentStock <= (product.lowStockThreshold || 5) && currentStock > 0) {
      alerts.push({
        productId,
        type: 'low_stock',
        threshold: product.lowStockThreshold || 5,
        currentStock,
        message: `${product.name} is running low on stock (${currentStock} remaining)`
      });
    }

    // Out of stock alert
    if (currentStock === 0) {
      alerts.push({
        productId,
        type: 'out_of_stock',
        threshold: 0,
        currentStock,
        message: `${product.name} is out of stock`
      });
    }

    // Create new alerts
    if (alerts.length > 0) {
      await InventoryAlert.insertMany(alerts);
    }

    return alerts;
  } catch (error) {
    console.error('Error checking inventory alerts:', error);
    return [];
  }
};

// ✅ Acknowledge inventory alert
const acknowledgeAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.auth?.userId || req.user?.id;

    const alert = await InventoryAlert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.acknowledgedBy.push({
      userId,
      acknowledgedAt: new Date()
    });
    alert.isActive = false;

    await alert.save();

    res.json({ success: true, message: 'Alert acknowledged successfully' });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ success: false, message: 'Failed to acknowledge alert' });
  }
};

module.exports = {
  getInventoryDashboard,
  updateStock,
  getInventoryLogs,
  getSuppliers,
  createSupplier,
  getPurchaseOrders,
  createPurchaseOrder,
  acknowledgeAlert
};