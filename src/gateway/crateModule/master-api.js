import axiosHttp from "../../interceptors/lambda-interceptor";

export const getCrateMasterData = async () => {
    try {
        const response = await axiosHttp.get("/crate");
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
};

export const addCrateMasterData = async (data) => {
    try {
        const response = await axiosHttp.post("/crate", data);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
    }
};