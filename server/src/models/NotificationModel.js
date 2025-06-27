const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'recipientModel', // or Employee, Distributor, etc.
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ['Admin', 'Employee', 'Distributor'],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'order', 'task', 'system'],
      default: 'info',
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      validate: {
        validator: function (v) {
          // ✅ supports optional query string
          return /^\/[a-zA-Z0-9\-_/]*(\?[a-zA-Z0-9=&_%-]*)?$/.test(v);
        },
        message: (props) => `${props.value} is not a valid relative URL path!`,
      },
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    relatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedModel',
    },
    relatedModel: {
      type: String,
      enum: [
        'Order',
        'Task',
        'Employee',
        'Product',
        'ProductOffer',
        'LeaveRequest',
        'LoginSession',
        'TaskCancelRequest',
      ],
    },
    autoDelete: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index for auto-deletion
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Auto-fill link and expiresAt before saving
notificationSchema.pre('save', function (next) {
  if (!this.link && this.relatedModel && this.relatedTo) {
    this.link = `/${this.relatedModel.toLowerCase()}/${this.relatedTo.toString()}`;
  }

  if (this.autoDelete && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hrs
  }

  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
