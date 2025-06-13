


exports.updateAdminNotificationSocket = (req)=>{
    try {
      const io = req.app.get('io');
      io.emit('AdminNotificationUpdate');
    } catch (socketError) {
      console.warn('Socket emit failed:', socketError.message);
    }
}