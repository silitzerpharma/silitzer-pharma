// src/socket.js
import { io } from 'socket.io-client';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Connect to your backend server
const socket = io(BASE_URL, {
  withCredentials: true,// if you're using cookies
   transports: ['websocket'], 
});

export default socket;
