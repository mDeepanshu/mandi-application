import axiosHttp from "../../interceptors/lambda-interceptor";

export const getPendingCrates = async (vyapariId) => {
    try {
        const response = await axiosHttp.get(`/crate/pending-crates?p_vyapari_id=${vyapariId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching pending crates:", error);
        throw error;
    }
};


export const saveReturnedCrates = async (payload) => {
    try {
        const response = await axiosHttp.post(`/crate/return`, payload);
        return response.data;
    } catch (error) {
        console.error("Error saving returned crates:", error);
        throw error;
    }
};
