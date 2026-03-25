import api from "@/utils/axios";

export const getListLogs = async (page = 1, search = "", mode = "all") => {
  let urlAPI = `/api/toup-wallet-log`;
  const params = [];

  if (page) params.push(`page=${page}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (mode && mode !== "all") params.push(`mode=${mode}`);

  if (params.length > 0) urlAPI += `?${params.join("&")}`;

  const result = await api.get(urlAPI);
  return result.data;
};

export const getListLogsPending = async (page = 1, search = "") => {
  let urlAPI = `/api/toup-wallet-log/pending`;
  const params = [];

  if (page) params.push(`page=${page}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);

  if (params.length > 0) urlAPI += `?${params.join("&")}`;

  const result = await api.get(urlAPI);
  return result.data;
};

export const manualChargeBalance = async (id, newStatus) => {
  const urlAPI = `/api/toup-wallet-log/update?id=${id}`;
  const result = await api.patch(urlAPI, { newStatus });
  return result.data;
};

export const getTopupStats = async (user_id = null) => {
  let urlAPI = `/api/toup-wallet-log/getTongtien`;
  if (user_id) urlAPI += `?user_id=${user_id}`;

  const result = await api.get(urlAPI);
  return result.data;
};

export const getTopupTotalInRange = async ({ from, to, user_id = null }) => {
  if (!from || !to) throw new Error("Missing from or to date");

  let urlAPI = `/api/wallet/tong-tien-trong-khoang?from=${from}&to=${to}`;
  if (user_id) urlAPI += `&user_id=${user_id}`;

  const result = await api.get(urlAPI);
  return result.data;
};

export const getLogByUser = async (page = 1) => {
  const urlAPI = `/api/toup-wallet-log/user-logs?page=${page}`;
  const result = await api.get(urlAPI);
  return result.data;
};
