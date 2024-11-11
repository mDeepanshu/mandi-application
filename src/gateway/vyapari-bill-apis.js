import axiosHttp from "../interceptors/error-handling-interceptor";

export const saveVyapariBill = async (bill) => {
  try {
    const response = await axiosHttp.post(`/vyapari/saveVyapariBill`,bill);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
    console.error('Not Throwing Error');
  }
};

  
export const getVyapariBill = async (vyapariId,date) => {
  try {
    const response = await axiosHttp.get(`/vyapari/generateBill?vyapariId=${vyapariId}&date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
  }
};
