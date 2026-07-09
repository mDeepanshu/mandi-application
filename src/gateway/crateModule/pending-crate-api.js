import axiosHttp from "../../interceptors/lambda-interceptor";

export const getPendingCrateSummary = async () => {
  try {
    const response = await axiosHttp.get(`/crate/pending-summary`, {
      snackbar: { showOnError: true, errorMsg: "Failed to fetch pending crates" },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching pending crate summary:", error);
    throw error;
  }
};
