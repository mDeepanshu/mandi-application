import axiosHttp from "../interceptors/error-handling-interceptor";

export const getKisanBillVersions = async (kisanId,billDate,index) => {
  try {
    const response = await axiosHttp.get(`/kisan-bill?kisanId=${kisanId}&billDate=${billDate}&index=${index}`);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
  }
};

export const getVyapariBillVersions = async (vyapariId,billDate,index) => {
  try {
    const response = await axiosHttp.get(`/vyapari-bill?vyapariId=${vyapariId}&billDate=${billDate}&index=${index}`);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
  }
};