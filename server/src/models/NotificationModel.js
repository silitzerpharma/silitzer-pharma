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
          return /^\/[a-zA-Z0-9\-_/]*$/.test(v); // basic relative URL path validation
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
      enum: ['Order', 'Task','Employee','Product','ProductOffer','LeaveRequest','LoginSession','TaskCancelRequest'], // add more as needed
    },
    autoDelete: {
      type: Boolean,
      default: false, // only auto-deletes if true
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// ✅ TTL index: auto-delete when expiresAt is reached
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ✅ Auto-fill link and expiresAt before saving
notificationSchema.pre('save', function (next) {
  // auto-generate link if not set
  if (!this.link && this.relatedModel && this.relatedTo) {
    this.link = `/${this.relatedModel.toLowerCase()}/${this.relatedTo.toString()}`;
  }

  // auto-set expiresAt if autoDelete is true and not already set
  if (this.autoDelete && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  }

  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
