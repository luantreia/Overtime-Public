import { io } from 'socket.io-client';

const isDev = window.location.hostname === 'localhost' || 
              window.location.hostname === '127.0.0.1' ||
              process.env.NODE_ENV === 'development';

const URL = isDev 
  ? 'http://localhost:5000'
  : 'https://overtime-ddyl.onrender.com';

console.log('[Public] Socket connecting to:', URL, '(isDev:', isDev, ')');

export const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket']
});
