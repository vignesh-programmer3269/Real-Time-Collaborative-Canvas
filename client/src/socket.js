import { io } from "socket.io-client";

const URL = process.env.BACKEND_URL;
console.log("Connecting to backend URL:", URL);

export const socket = io(URL, {
  autoConnect: false,
});
