import api from "@/utils/axios";

export const getLeaderboard = async () => {
    try {
        const response = await api.get("/api/statistics/leaderboard");
        return response.data;
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return null;
    }
};

export const getBestSellers = async () => {
    try {
        const response = await api.get("/api/statistics/best-sellers");
        return response.data;
    } catch (error) {
        console.error("Error fetching best sellers:", error);
        return null;
    }
};

export const getQuickStats = async () => {
    try {
        const response = await api.get("/api/statistics/quick-stats");
        return response.data;
    } catch (error) {
        console.error("Error fetching quick stats:", error);
        return null;
    }
};
