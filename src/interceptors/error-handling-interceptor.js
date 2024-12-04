import axios from 'axios';
import config from '../constants/config';

const axiosHttp = axios.create({
    baseURL: config.apiBaseUrl,
});

axiosHttp.interceptors.response.use(

    (response) => {
        return response;
    },
    (error) => {
        if (error?.response?.status != 200) {
        }
        return Promise.reject('error');

    }
);

export default axiosHttp;