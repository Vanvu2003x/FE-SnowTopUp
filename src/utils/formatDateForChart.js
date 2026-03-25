import { format } from "date-fns";

export const formatChartData = (rawData) => {
    return rawData.map((item) => ({
        date: format(new Date(item.date), "dd/MM/yyyy"),
        total_amount: parseInt(item.total_amount),
        total_cost: parseInt(item.total_cost),
    }));
};
