// src/socket.js
import { io } from 'socket.io-client';

// Connect to your backend server
const socket = io('http://localhost:3000', {
  withCredentials: true,// if you're using cookies
   transports: ['websocket'], 
});

export default socket;
