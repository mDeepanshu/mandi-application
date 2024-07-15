import axios from 'axios';
import config from "../constants/config";

const axiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
});

export const submitKisanBill = async (post) => {
  try {
    const response = await axiosInstance.post('https://jsonplaceholder.typicode.com/posts', post);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getKisanBill = async (kisanId,date) => {
  try {
    const response = await axiosInstance.get(`/kisan/generateBill?kisanId=${kisanId}&date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
};

export const getKisanNameList = async () => {
  try {
    const response = await axiosInstance.get(`/party/listAllParties`);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
};