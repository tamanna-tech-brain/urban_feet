const store = require('../utils/dataStore');

// @desc Get user notifications
// @route GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    let list = store.notifications;
    if (req.user) {
      list = list.filter(n => String(n.recipient) === String(req.user._id));
    }
    const unreadCount = list.filter(n => !n.isRead).length;
    res.json({ success: true, count: list.length, unreadCount, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Mark single notification as read
// @route PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notif = store.notifications.find(n => String(n._id) === String(req.params.id));
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    notif.isRead = true;
    store.saveToFile();
    res.json({ success: true, data: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Mark all notifications as read
// @route PATCH /api/notifications/mark-all-read
exports.markAllAsRead = async (req, res) => {
  try {
    if (req.user) {
      store.notifications.forEach(n => {
        if (String(n.recipient) === String(req.user._id)) {
          n.isRead = true;
        }
      });
      store.saveToFile();
    }
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
