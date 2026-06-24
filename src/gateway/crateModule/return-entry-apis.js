import axiosHttp from "../../interceptors/lambda-interceptor";

export const getPendingCrates = async (vyapariId) => {
    try {
        const response = await axiosHttp.get(`/crate/pending-crates?p_vyapari_id=${vyapariId}`, {
            snackbar: { showOnError: true, errorMsg: "Failed to fetch pending crates" },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching pending crates:", error);
        throw error;
    }
};


export const saveReturnedCrates = async (payload) => {
    try {
        const response = await axiosHttp.post(`/crate/return`, payload, {
            snackbar: { showOnSuccess: true, successMsg: "Crate return saved", showOnError: true, errorMsg: "Failed to save crate return" },
        });
        return response.data;
    } catch (error) {
        console.error("Error saving returned crates:", error);
        throw error;
    }
};
