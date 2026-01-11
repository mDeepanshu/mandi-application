import axiosHttp from "../interceptors/error-handling-interceptor";

export const getAllPartyList = async (partyType, cachedRes = true) => {
  try {
    if (cachedRes && localStorage.getItem(`partyList-${partyType}`)) {
      return JSON.parse(localStorage.getItem(`partyList-${partyType}`));
    }
    const response = await axiosHttp.get(`/party/listAllParties?partyType=${partyType}`);
    localStorage.setItem(`partyList-${partyType}`, JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Error posting data:", error);
  }
};

export const updateAuctionTransaction = async (updateObject) => {
  try {
    const response = await axiosHttp.post(`/auction/edit-auction-transaction`, updateObject);
    return response.data;
  } catch (error) {
    console.error("Error posting data:", error);
  }
};

export const getTodaysVyapari = async (from, to) => {
  try {
    const response = await axiosHttp.get(`/vyapari/ledger-list-all-vyapari?startDate=${from}&endDate=${to}`);
    return response.data;
  } catch (error) {
    console.error("Error posting data:", error);
  }
};

export const getEveryLedger = async (from, to, vyapariList) => {
  try {
    const response = await axiosHttp.post(`/vyapari/ledger-list?startDate=${from}&endDate=${to}`, vyapariList);
    return response.data;
  } catch (error) {
    console.error("Error posting data:", error);
  }
};

export const getItem = async (cachedRes = true) => {
  try {
    if (cachedRes && localStorage.getItem(`itemList`)) {
      return JSON.parse(localStorage.getItem(`itemList`));
    }
    const response = await axiosHttp.get("item/listItems");
    localStorage.setItem(`itemList`, JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Error posting data:", error);
    console.error("Not Throwing Error");
  }
};
