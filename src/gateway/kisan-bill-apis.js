import axiosHttp from "../interceptors/lambda-interceptor";

// export const submitKisanBill = async (post) => {
//   try {
//     const response = await axiosHttp.post('https://jsonplaceholder.typicode.com/posts', post);
//     return response.data;
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };

export const getKisanBill = async (billId) => {
  try {
    const response = await axiosHttp.get(`kisan/generateBill?billId=${billId}`);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
  }
};

export const saveKisanBill = async (bill) => {
  try {
    const response = await axiosHttp.post(`kisan/saveBill`,bill);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
  }
};

export const kisanBillSummary = async (date) => {
  try {
    const response = await axiosHttp.get(`kisan/kisanBillPaymentSummary?date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
  }
};

export const saveAllKisanBill = async () => {
  try {
    const response = await axiosHttp.patch(`/autoSaveBills`);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
  }
};

export const getPendingStockSummary = async (startDate,endDate) => {
  try {
    const response = await axiosHttp.get(`kisan/pendingStockSummary?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
  }
};

export const getKisanPendingStockApi = async (partyId) => {
  try {
    const response = await axiosHttp.get(`kisan/PendingByKisanId?kisanId=${partyId}`);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
  }
};