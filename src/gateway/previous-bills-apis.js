import axiosHttp from "../interceptors/error-handling-interceptor";

export const getBillVersions = async (kisanId,billDate,index) => {
  try {
    const response = await axiosHttp.get(`/kisan-bill?kisanId=${kisanId}&billDate=${billDate}&index=${index}`);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
  }
};