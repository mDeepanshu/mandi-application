import axiosHttp from "../../interceptors/lambda-interceptor";

export const getCrateStockReport = async (date) => {
    try {
        const response = await axiosHttp.get(`/crate/stock-report?p_date=${date}`, {
            snackbar: { showOnSuccess: true, successMsg: "Stock report loaded", showOnError: true, errorMsg: "Failed to fetch stock report" },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching crate stock report:", error);
        throw error;
    }
};