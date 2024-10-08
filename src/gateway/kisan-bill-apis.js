import axiosHttp from "../interceptors/error-handling-interceptor";

export const submitKisanBill = async (post) => {
  try {
    const response = await axiosHttp.post('https://jsonplaceholder.typicode.com/posts', post);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    console.error('Not Throwing Error');
  }
};

export const getKisanBill = async (kisanId, date) => {
  try {
    const response = await axiosHttp.get(`/kisan/generateBill?kisanId=${kisanId}&date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
    console.error('Not Throwing Error');
  }
};
