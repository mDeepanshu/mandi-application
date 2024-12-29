import axiosHttp from "../interceptors/error-handling-interceptor";

export const getVasuliList = async (startDate,endDate) => {
  try {
    const response = await axiosHttp.get(`/vyapari/vasuli-list?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};