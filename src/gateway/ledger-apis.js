import axiosHttp from "../interceptors/error-handling-interceptor";

export const getLedger = async (vyapariId, startDate, endDate) => {
  try {
    const response = await axiosHttp.get(`/vyapari/ledger?vyapariId=${vyapariId}&startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
  }
};

export const makeVasuli = async (data, confirmDuplicate) => {
  try {
    const response = await axiosHttp.post(`party/vasuliTrasaction?confirmDuplicate=${confirmDuplicate}`, data);
    return response.data;
  } catch (error) {
    return "error";
  }
};

export const markVyapariAllowedTransactions = async (vyapariId, startDate, endDate) => {
  try {
    const response = await axiosHttp.patch(`auction/mark-transaction-validated?fromDate=${startDate}&toDate=${endDate}&vyapariId=${vyapariId}`, {});
    return response.data;
  } catch (error) {
    return "error";
  }
};

export const sendLedgerNotiApi = async (vyapariId) => {
  try {
    const response = await fetch(`https://imll8stdk8.execute-api.ap-southeast-1.amazonaws.com/prod/sendnotification/${vyapariId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "LEDGER RECEIVED/लेजर प्राप्त हुआ",
        amount: "",
        ledger: true
      }),
    });

    const data = await response.json();
  } catch (error) {
    console.error("Error:", error);
  }
};
