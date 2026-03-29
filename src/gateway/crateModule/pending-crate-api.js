import axiosHttp from "../../interceptors/lambda-interceptor";

export const getPendingCrateSummary = async () => {
  try {
    const response = await axiosHttp.get(`/crate/pending-summary`);

    return response.data;
  } catch (error) {
    console.error("Error fetching pending crate summary:", error);
    throw error;
  }
};
