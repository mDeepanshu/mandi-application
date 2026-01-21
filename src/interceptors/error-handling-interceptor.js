import axios from "axios";
import config from "../constants/config";

const axiosHttp = axios.create({
  baseURL: config.apiBaseUrl,
});

axiosHttp.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log(error);

    if (error?.response?.status != 200) {
    }
    return Promise.reject("error");
  }
);

axiosHttp.interceptors.request.use(
  (config) => {
    // Modify the request config before it is sent
    const deviceId = `41`; // Retrieve the deviceId from local storage
    if (deviceId) {
      config.headers.deviceId = deviceId;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

export default axiosHttp;
