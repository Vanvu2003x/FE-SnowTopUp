import api from "@/utils/axios";

//Hàm lấy order
export const getAllOrder = async (page) => {
  const res = await api.get(`/api/order?page=${page}`);
  return res.data;
};

// hamf laysa oder theo status
export const getAllOrderByStatus = async (status, page = 1) => {
  const res = await api.get(
    `/api/order/by-status?status=${status}&page=${page}`
  );

  return res.data;
};

// Hàm lấy thống kê chi phí (có xác thực bằng JWT - nay là cookie)
export const getOrderStatistics = async () => {
  try {
    const res = await api.get("/api/order/stats/cost");
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy thống kê đơn hàng:", err);
    throw err;
  }
};

//Hàm thay đổi status

export const changeStatus = async (id, newStatus) => {
  const res = await api.post(
    `/api/order/change-status/${id}`,
    {
      status: newStatus,
    }
  );

  return res.data;
};

export const searchOrder = async (keyword) => {
  const res = await api.get(
    `/api/order/search?keyword=${keyword}`
  );
  return res.data;
};

export const createOrder = async (data) => {
  const apiurl = "/api/order/";

  const res = await api.post(apiurl, data);

  return res.data;
};
export const CancelOrder = async (id) => {
  // User self-cancel
  const apiurl = `/api/order/${id}/cancel`;
  const res = await api.put(apiurl, {});

  return res.data;
};

export const getOrdersByUserId = async (page = 1) => {
  const apiurl = `/api/order/user?page=${page}`;

  const res = await api.get(apiurl);

  return res.data;
}

export const updateOrderAccountInfo = async (id, account_info) => {
  const apiurl = `/api/order/${id}/account`;

  const res = await api.patch(apiurl, { account_info });

  return res.data;
};
export const getOrdersByUserNap = async (status) => {
  let apiurl = "/api/order/mynap";

  // Nếu có status thì thêm query param
  if (status) {
    apiurl += `?status=${status}`;
  }

  const res = await api.get(apiurl);

  return res.data;
};
// Nhận đơn (chuyển trạng thái -> processing)
export const acceptOrder = async (id) => {
  const apiurl = `/api/order/${id}/accept`;
  const res = await api.post(apiurl, {});

  return res.data;
};
// Hoàn thành đơn (status = success)
export const completeOrder = async (id) => {
  const res = await api.post(
    `/api/order/${id}/complete`,
    {}
  );
  return res.data;
};

// Hủy đơn + hoàn tiền (status = cancel)
export const cancelOrder1 = async (id) => {
  // Admin Cancel & Refund
  const res = await api.post(
    `/api/order/cancel-refund/${id}`,
    {}
  );
  return res.data;
};
// Lấy summary: tổng pending + stats của user_id_nap
export const getOrderSummary = async () => {
  try {
    const res = await api.get("/api/order/summary");
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy summary đơn hàng:", err);
    throw err;
  }
};
export const getTransactionHistory = async (page = 1) => {
  const res = await api.get(`/api/order/transaction-history?page=${page}`);
  return res.data;
};
