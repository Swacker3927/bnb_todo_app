import { boot } from 'quasar/wrappers';
import { io } from "socket.io-client";

const socket = io(process.env.CHAT_SOCKET, { transports: ['websocket'], autoConnect: false });

if (process.env.DEV) {
  socket.onAny((event, ...args) => {
    console.log(event, args);
  });
}

export default boot(({ app }) => {
  app.config.globalProperties.$socket = socket;
});

export { socket };
