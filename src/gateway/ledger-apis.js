import axiosHttp from "../interceptors/error-handling-interceptor";

export const getLedger = async (vyapariId,startDate,endDate) => {
  try {
    const response = await axiosHttp.get(`/vyapari/ledger?vyapariId=${vyapariId}&startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};