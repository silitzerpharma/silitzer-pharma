import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Drawer,
  Typography,
  Divider,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import './style/NotificationPanel.scss'

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

import CloseIcon from '@mui/icons-material/Close';

const NotificationPanel = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const navigate = useNavigate();

  const fetchNotifications = async (pageToLoad = 0) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/notifications?page=${pageToLoad}&limit=${limit}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (Array.isArray(data.notifications)) {
        setNotifications((prev) => [...prev, ...data.notifications]);
        setHasMore((pageToLoad + 1) * limit < data.total);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await fetch(`${BASE_URL}/admin/notifications/seen?Notification_id=${notification._id}`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.warn('Mark seen failed:', err);
    }
   

  let link = notification.link;
  if (!link.startsWith('/admin')) {
    link = `/admin${link}`;
  }

  navigate(link)

    if (onClose) onClose();
  };

  const observer = useRef();
  const lastNotificationRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  return (
    <Drawer anchor="right" open onClose={onClose}>
      <Box sx={{ width: 350, p: 2 }}>
        <Typography variant="h6" className='nfc-head'>Notifications
          <button onClick={onClose} className='nfc-close-btn' ><CloseIcon/></button>
        </Typography>



        
        <Divider sx={{ my: 1 }} />
        
        <List>
          {notifications.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              No notifications found.
            </Typography>
          )}

          {notifications.map((notification, index) => {
            const isLast = notifications.length === index + 1;

            const NotificationItem = (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ListItem
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.isSeen ? 'inherit' : '#e3f2fd',
                    cursor: 'pointer',
                  }}
                  component="div"
                >
                  <ListItemAvatar>
                    <Avatar>{notification.type?.[0]?.toUpperCase() || 'N'}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="textSecondary" display="block">
                          {notification.message}
                        </Typography>
                        <Typography component="span" variant="caption" color="textSecondary" display="block">
                          {new Date(notification.createdAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </motion.div>
            );

            return isLast ? (
              <div ref={lastNotificationRef} key={notification._id}>
                {NotificationItem}
              </div>
            ) : (
              NotificationItem
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default NotificationPanel;
