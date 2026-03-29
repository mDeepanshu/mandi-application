import axiosHttp from "../../interceptors/lambda-interceptor";

export const getCrateStockReport = async (date) => {
    try {
        const response = await axiosHttp.get(`/crate/stock-report?p_date=${date}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching crate stock report:", error);
        throw error;
    }
};