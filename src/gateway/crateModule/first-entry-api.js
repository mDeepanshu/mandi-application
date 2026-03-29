import axiosHttp from "../../interceptors/lambda-interceptor";

export const getCrateSummaryByDate = async (date) => {
    try {
        const response = await axiosHttp.get(`/crate/summary?p_date=${date}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching crate summary:", error);
        throw error;
    }
};