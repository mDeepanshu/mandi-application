import axiosHttp from "../../interceptors/lambda-interceptor";

/**
 * Auction crate list — crates issued against each kisan's lot, per vyapari.
 *
 * Expected contract — adjust the two URLs below once the real endpoints exist.
 *
 * GET /crate/auction-list?p_date=YYYY-MM-DD
 * {
 *   responseCode: "200",
 *   responseBody: [
 *     {
 *       id: 91,                    // entry id — required, the edit targets it
 *       kisan_name: "RAM SINGH",
 *       vyapari_id: "10",          // internal party id
 *       vyapari_idNo: "1002",      // display id; if omitted, the screen derives
 *                                  // it from the cached vyapari party list
 *       vyapari_name: "BU KISHAN",
 *       crate_id: 3,
 *       crate_name: "PLASTIC",
 *       crate_count: 12
 *     }
 *   ]
 * }
 *
 * PUT /crate/auction-entry
 * { id: 91, crate_id: 3, count: 14 }
 *
 * Count is absolute (not a delta). The kisan/vyapari pairing is not editable.
 */

export const getAuctionCrateList = async (date) => {
  try {
    const response = await axiosHttp.get(`/crate/auction-list?p_date=${date}`, {
      snackbar: { showOnError: true, errorMsg: "Failed to fetch auction crate list" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching auction crate list:", error);
    throw error;
  }
};

export const updateAuctionCrateEntry = async (payload) => {
  try {
    const response = await axiosHttp.put(`/crate/auction-entry`, payload, {
      snackbar: {
        showOnSuccess: true,
        successMsg: "Crate entry updated",
        showOnError: true,
        errorMsg: "Failed to update crate entry",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating auction crate entry:", error);
    throw error;
  }
};
