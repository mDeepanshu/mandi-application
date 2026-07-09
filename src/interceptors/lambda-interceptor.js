import axios from "axios";
import config from "../constants/config";
import { showSnackbar } from "../shared/services/snackbar-service";

const axiosHttp = axios.create({
  baseURL: config.lambdaApiBaseUrl,
});

axiosHttp.interceptors.response.use(
  (response) => {
    const snackbarCfg = response.config?.snackbar;
    if (snackbarCfg?.showOnSuccess) {
      showSnackbar({
        open: true,
        alertType: "success",
        alertMsg: snackbarCfg.successMsg || "Success",
      });
    }
    return response;
  },
  (error) => {
    console.log(error);
    const snackbarCfg = error?.config?.snackbar;
    if (snackbarCfg?.showOnError) {
      showSnackbar({
        open: true,
        alertType: "error",
        alertMsg: snackbarCfg.errorMsg || "Something went wrong",
      });
    }
    return Promise.reject("error");
  }
);

axiosHttp.interceptors.request.use(
  (config) => {
    // Modify the request config before it is sent
    const deviceId = `25`; // Retrieve the deviceId from local storage
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
