import axiosHttp from "../interceptors/error-handling-interceptor";

export const getAllPartyList = async (partyType) => {
    try {
      const response = await axiosHttp.get(`/party/listAllParties?partyType=${partyType}`);
      return response.data;
    } catch (error) {
      console.error('Error posting data:', error);
          console.error('Not Throwing Error');

    }
  };

  export const getAllPartyListTest = async () => {
    try {
      const response = await axiosHttp.get(`https://mobileqacloud.dalmiabharat.com/csr/list-lever`);
      return response.data;
    } catch (error) {
      console.error('Error posting data:', error);
          console.error('Not Throwing Error');

    }
  };