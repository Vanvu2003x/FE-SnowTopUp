import api from "@/utils/axios";

export const getUrlPayment = async (requestData) => {
  try {
    const res = await api.post("/api/payment/createQR", requestData);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi tạo payment link:", error);
    throw error;
  }
};
// Hủy đơn nạp
export const cancelPaymentAPI = async (id) => {
  if (!id) throw new Error("Thiếu ID");

  // Endpoint in WalletLog route is POST /cancel
  const urlAPI = `/api/toup-wallet-log/cancel?id=${id}`;

  const result = await api.post(
    urlAPI,
    {}
  );

  return result.data;
};