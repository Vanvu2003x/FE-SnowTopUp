import api from "@/utils/axios";

export const getGames = async () => {
  const res = await api.get("/api/games");
  return res.data;
};

export const getGamesByType = async (type) => {
  const res = await api.get(`/api/games/by-type?type=${type}`)
  return res.data
}


export const createGame = async (formData) => {
  const res = await api.post("/api/games/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const deleteGame = async (id) => {
  const res = await api.delete(`/api/games/delete?id=${id}`);
  return res.data;
};

export const updateGame = async (id, formData) => {
  const res = await api.patch(`/api/games/update?id=${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const getGameByGameCode = async (gamecode) => {
  const res = await api.get(`/api/games/game/${gamecode}`)
  return res.data
}