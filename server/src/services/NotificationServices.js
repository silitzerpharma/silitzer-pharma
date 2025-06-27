const Admin = require('../models/AdminModel');
const Notification = require('../models/NotificationModel');

exports.saveNotificationForAdmin = async (
  title,
  message,
  type = 'info',
  relatedTo = null,
  relatedModel = null,
  autoDelete = false,
  expiresAt = null,
  icon = null,
  priority = 'low',
  link = null // ✅ Add this
) => {
  try {
    const admin = await Admin.findOne(); // assuming only one admin

    if (!admin) {
      console.error('No admin found to send notification');
      return false;
    }

    const notification = new Notification({
      recipient: admin._id,
      recipientModel: 'Admin',
      title,
      message,
      type,
      relatedTo,
      relatedModel,
      autoDelete,
      expiresAt,
      icon,
      priority,
      link, // ✅ Use the link
    });

    await notification.save();
    return true;
  } catch (err) {
    console.error('Error saving admin notification:', err);
    return false;
  }
};
