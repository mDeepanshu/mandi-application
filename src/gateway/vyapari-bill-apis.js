import axiosHttp from "../interceptors/error-handling-interceptor";

export const submitVyapariBill = async (post) => {
    try {
        const response = await axiosHttp.post('https://jsonplaceholder.typicode.com/posts', post);
        return response.data;
      } catch (error) {
        console.error('Error:', error);
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
