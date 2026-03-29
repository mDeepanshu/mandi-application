import axiosHttp from "../../interceptors/lambda-interceptor";

export const getCrateVasuliSheet = async (date) => {
  try {
    const response = await axiosHttp.get(`/crate/vasuli-sheet?p_date=${date}`);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
  }
};
