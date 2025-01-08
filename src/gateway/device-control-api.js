import axiosHttp from "../interceptors/error-handling-interceptor";

export const getAllDevices = async () => {
  try {
    const response = await axiosHttp.get(`/device/listDevices?status=REQUESTED&status=REJECTED&status=APPROVED`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

export const updateStatus = async (deviceId,status) => {
    try {
        const response = await axiosHttp.put(`device/${deviceId}/status?status=${status}`);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        return 'error';
        // throw error;

    }
};
