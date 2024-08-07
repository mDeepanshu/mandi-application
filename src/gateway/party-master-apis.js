import axios from 'axios';
import config from "../constants/config";


const axiosInstance = axios.create({
    baseURL: config.apiBaseUrl,
});

export const addPartyGlobal = async (data) => {
    try {
        const response = await axiosInstance.post('/party', data);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};

export const getPartyGlobal = async () => {
    try {
        const response = await axiosInstance.post('/parties');
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};