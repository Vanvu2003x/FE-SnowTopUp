import api from "@/utils/axios";

// Lấy tất cả orders
export async function getAllOrder() {
  const res = await api.get(`/api/accOrder`);
  return res.data.data;
}

// Hủy đơn
export async function cancelOrder(orderId) {
  const res = await api.put(`/api/accOrder/${orderId}/cancel`, {});
  return res.data.data;
}

// Gửi tài khoản cho user
export async function sendAcc(orderId, accInfo) {
  const res = await api.put(`/api/accOrder/${orderId}/send`, accInfo);
  return res.data.data;
}
export async function BuyAcc(order_info) {
  const res = await api.post(`/api/accOrder/`, order_info);
  return res.data; // createOrder controller returns result directly.
}

// Lấy tất cả orders
export async function getMyOrder() {
  const res = await api.get(`/api/accOrder/my-orders`);
  return res.data.data;
}

