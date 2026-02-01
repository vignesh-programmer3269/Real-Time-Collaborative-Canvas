import { io } from "socket.io-client";

const URL = process.env.REACT_APP_BACKEND_URL;
console.log("Connecting to backend URL:", URL);

export const socket = io(URL, {
  transports: ["websocket"],
  autoConnect: false,
});
