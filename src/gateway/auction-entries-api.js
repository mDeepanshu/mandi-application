import axiosHttp from "../interceptors/error-handling-interceptor";

export const getAuctionEntriesList = async (startDate,endDate,deviceId) => {
  try {
    const response = await axiosHttp.get(`/auction/list-auction-transaction?startDate=${startDate}&endDate=${endDate}&deviceId=${deviceId}`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

export const getActiveDevices = async () => {
  try {
    const response = await axiosHttp.get(`/device/listDevices?status=APPROVED`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

export const editAuction = async (obj,deviceId) => {
  try {
    const response = await axiosHttp.patch(`/auction/edit-auction`,obj,{headers:{"deviceId":deviceId}});
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};
