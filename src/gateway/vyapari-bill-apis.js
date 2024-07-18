import axios from 'axios';
import config from "../constants/config";

const axiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
});

export const submitVyapariBill = async (post) => {
    try {
        const response = await axios.post('https://jsonplaceholder.typicode.com/posts', post);
        return response.data;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }    
  };

  
export const getVyapariBill = async (vyapariId,date) => {
  try {
    const response = await axiosInstance.get(`/vyapari/generateBill?vyapariId=${vyapariId}&date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
};
