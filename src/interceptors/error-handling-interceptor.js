import axios from 'axios';
import config from '../constants/config'; 

const axiosHttp = axios.create({
    baseURL: config.apiBaseUrl,
});

axiosHttp.interceptors.response.use(
    
    (response) => {
        
        
        console.log("Interceptor no error");

        return response;
    },
    (error) => {
        
        
        console.log("Interceptor error");

        if (error?.response?.status != 200) {
            
        }
          return Promise.reject('error');
        
    }
);

export default axiosHttp;