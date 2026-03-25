import { io } from "socket.io-client";

let socket = null;

const listeners = {
  balance: new Set(),
  order: new Set(),
  payment: new Set()
};

/**
 * Get Socket.IO server URL
 */
const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return undefined;
};

export const connectSocket = (token, onBalanceUpdate, onOrderUpdate, onPaymentSuccess) => {
  const URL = getSocketUrl();

  if (onBalanceUpdate) listeners.balance.add(onBalanceUpdate);
  if (onOrderUpdate) listeners.order.add(onOrderUpdate);
  if (onPaymentSuccess) listeners.payment.add(onPaymentSuccess);

  if (!socket) {
    socket = io(URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      autoConnect: true
    });

    socket.on("connect", () => {
      if (token) {
        socket.emit("auth", token);
      }
    });

    socket.on("connect_error", () => { });

    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        socket.connect();
      }
    });

    socket.on("reconnect", () => { });
    socket.on("reconnect_error", () => { });

    socket.on("authenticated", (user) => {
      localStorage.setItem("balance", user.balance);
      listeners.balance.forEach(cb => cb(user.balance));
    });

    socket.on("balance_update", (newBalance) => {
      localStorage.setItem("balance", newBalance);
      listeners.balance.forEach(cb => cb(newBalance));
    });

    socket.on("order_update", (orderData) => {
      listeners.order.forEach(cb => cb(orderData));
    });

    socket.on("order_status_update", (data) => {
      listeners.order.forEach(cb => cb(data));
    });

    socket.on("payment_success", (data) => {
      listeners.payment.forEach(cb => cb(data));
    });
  } else if (!socket.connected) {
    socket.connect();
  }

  return {
    socket,
    unsubscribe: () => {
      if (onBalanceUpdate) listeners.balance.delete(onBalanceUpdate);
      if (onOrderUpdate) listeners.order.delete(onOrderUpdate);
      if (onPaymentSuccess) listeners.payment.delete(onPaymentSuccess);
    }
  };
};

export const getSocket = () => socket;

export const isSocketConnected = () => socket?.connected ?? false;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
