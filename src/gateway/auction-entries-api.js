import axiosHttp from "../interceptors/error-handling-interceptor";

export const getAuctionEntriesList = async (startDate,endDate) => {
  try {
    const response = await axiosHttp.get(`/auction/list-auction-transaction?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};