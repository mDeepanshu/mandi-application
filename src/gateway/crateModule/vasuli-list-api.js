import axiosHttp from "../../interceptors/lambda-interceptor";

/**
 * Crate vasuli (return) list for a single day.
 *
 * GET /crate/vasuli-list?p_date=YYYY-MM-DD
 * {
 *   responseCode: "200",
 *   responseBody: [
 *     {
 *       vyapari_id: "10",
 *       vyapari_name: "BU KISHAN",
 *       crates: [
 *         { crate_id: 3, crate_name: "PLASTIC", crate_count: 3 },
 *         { crate_id: 5, crate_name: "MD",      crate_count: 2 }
 *       ]
 *     }
 *   ]
 * }
 *
 * PUT /crate/vasuli
 * {
 *   vyapariId: "10",
 *   date: "YYYY-MM-DD",
 *   crates: [ { crate_id: 3, count: 4 }, { crate_id: 5, count: 0 } ]
 * }
 * Counts are absolute (not deltas). A crate type that was in the day's vasuli
 * but has been removed in the edit is sent with count: 0 so the backend clears it.
 */

export const getCrateVasuliList = async (date) => {
  try {
    const response = await axiosHttp.get(`/crate/vasuli-list?p_date=${date}`, {
      snackbar: { showOnError: true, errorMsg: "Failed to fetch crate vasuli list" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching crate vasuli list:", error);
    throw error;
  }
};

export const updateCrateVasuli = async (payload) => {
  try {
    const response = await axiosHttp.put(`/crate/vasuli`, payload, {
      snackbar: {
        showOnSuccess: true,
        successMsg: "Vasuli updated",
        showOnError: true,
        errorMsg: "Failed to update vasuli",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating crate vasuli:", error);
    throw error;
  }
};
