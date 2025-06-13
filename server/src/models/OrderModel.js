const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['Pending','Approved', 'Processing', 'Shipped', 'Delivered', 'Cancelled','Hold'],
  },
  changedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  distributor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuthUser', 
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending','Approved', 'Processing', 'Shipped', 'Delivered', 'Cancelled','Hold'],
    default: 'Pending'
  },
  statusHistory: {
    type: [statusHistorySchema],
    default: []
  },
  productList: {
    type: [productSchema],
    required: true,
    validate: v => Array.isArray(v) && v.length > 0
  },
 orderInstructions: {
    type: String,
    default: '',
    trim: true,
  },

  // ✅ Updated billing fields
  subtotal: {
    type: Number,
    min: 0
  },
  netAmount: {
    type: Number,
    min: 0
  },
  receivedAmount: {
    type: Number,
    min: 0
  },
  totalPurchaseCost: {     // <-- New field added here
    type: Number,
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Partially Paid'],
    default: 'Pending'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
