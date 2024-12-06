import axiosHttp from "../interceptors/error-handling-interceptor";

export const getVyapariVasuliSheet = async (data) => {
  const httpParams = new URLSearchParams();
  Object.keys(data).forEach((key) => {
    httpParams.append(key, data[key]);
});
  try {
    const response = await axiosHttp.get(`/auction/generate-ledger`,{params: data});
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};