import axios from 'axios';
import config from "../constants/config";

const axiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
});

export const getAllPartyList = async () => {
    try {
      const response = await axiosInstance.get(`/party/listAllParties`);
      return response.data;
    } catch (error) {
      console.error('Error posting data:', error);
      throw error;
    }
  };