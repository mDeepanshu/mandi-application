import axiosHttp from "../../interceptors/lambda-interceptor";

export const getCrateSummaryByDate = async (date) => {
    try {
        const response = await axiosHttp.get(`/crate/summary?p_date=${date}`, {
            snackbar: { showOnError: true, errorMsg: "Failed to fetch crate summary" },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching crate summary:", error);
        throw error;
    }
};

export const updateCrateSummary = async (payload) => {
    try {
        const response = await axiosHttp.put(`/crate/summary`, payload, {
            snackbar: { showOnSuccess: true, successMsg: "Crate summary updated", showOnError: true, errorMsg: "Failed to update crate summary" },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating crate summary:", error);
        throw error;
    }
};