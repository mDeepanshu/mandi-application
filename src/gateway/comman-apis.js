import axiosHttp from "../interceptors/error-handling-interceptor";

export const getAllPartyList = async (partyType) => {
  try {
    const response = await axiosHttp.get(`/party/listAllParties?partyType=${partyType}`);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
  }
};

export const updateAuctionTransaction = async (updateObject) => {
  try {
    const response = await axiosHttp.post(`/auction/edit-auction-transaction`,updateObject);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
  }
};

export const getTodaysVyapari = async (from,to) => {
  try {
    const response = await axiosHttp.get(`/vyapari/ledger-list-all-vyapari?startDate=${from}&endDate=${to}`);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
  }
};

export const getEveryLedger = async (from,to,vyapariList) => {
  try {
    const response = await axiosHttp.post(`/vyapari/ledger-list?startDate=${from}&endDate=${to}`,vyapariList);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
  }
};

export const getItem = async () => {
  try {
      const response = await axiosHttp.get('/listItems');
      return response.data;
  } catch (error) {
      console.error('Error posting data:', error);
          console.error('Not Throwing Error');

  }
};