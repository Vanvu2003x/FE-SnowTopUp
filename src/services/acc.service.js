import api from "@/utils/axios";

// Lấy danh sách acc theo game + filter + phân trang
export async function getAllAcc(game_id, keyword, min, max, page = 1, limit = 10) {
  try {
    if (!game_id) {
      throw new Error("game_id bắt buộc phải có");
    }

    let url = `/api/acc/game?`;
    const params = [
      `game_id=${encodeURIComponent(game_id)}`,
      `page=${encodeURIComponent(page)}`,
      `limit=${encodeURIComponent(limit)}`
    ];

    if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
    if (min !== undefined) params.push(`min=${min}`);
    if (max !== undefined) params.push(`max=${max}`);

    url += params.join("&");

    const res = await api.get(url);
    return res.data; // { total, data: [...] }
  } catch (err) {
    console.error("Error in getAllAcc:", err);
    throw err;
  }
}

// Thêm account mới
export async function addAcc(formData) {
  try {
    const res = await api.post("/api/acc", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err) {
    console.error("Error in addAcc:", err);
    throw err;
  }
}

// Cập nhật account
export async function updateAcc(id, formData) {
  try {
    const res = await api.put(`/api/acc/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err) {
    console.error("Error in updateAcc:", err);
    throw err;
  }
}

// Xóa account
export async function deleteAcc(id) {
  try {
    const res = await api.delete(`/api/acc/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error in deleteAcc:", err);
    throw err;
  }
}
