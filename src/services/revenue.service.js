import api from "@/utils/axios";

/**
 * Get comprehensive revenue overview
 * Includes: total, monthly, daily, and 30-day breakdown
 */
export const getRevenueOverview = async () => {
    const result = await api.get("/api/statistics/revenue/overview");
    return result.data;
};

/**
 * Get profit margin calculations
 * Returns revenue, cost, profit, and margin percentages
 */
export const getProfitMargin = async () => {
    const result = await api.get("/api/statistics/revenue/profit-margin");
    return result.data;
};

/**
 * Get growth rate comparisons
 * Compares current vs previous periods
 */
export const getGrowthRates = async () => {
    const result = await api.get("/api/statistics/revenue/growth");
    return result.data;
};

/**
 * Get top revenue sources (top contributing users)
 */
export const getTopRevenueSources = async (limit = 10) => {
    const result = await api.get(`/api/statistics/revenue/top-sources?limit=${limit}`);
    return result.data;
};

/**
 * Get revenue data filtered by period
 * @param {string} period - 'daily', 'weekly', or 'monthly'
 */
export const getRevenueByPeriod = async (period = 'daily') => {
    const result = await api.get(`/api/statistics/revenue/by-period?period=${period}`);
    return result.data;
};
