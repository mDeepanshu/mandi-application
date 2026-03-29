import axiosHttp from "../../interceptors/lambda-interceptor";

export const getLedger = async (vyapariId, startDate, endDate) => {
  try {
    const response = await axiosHttp.get(`/crate/ledger?p_vyapari_id=${vyapariId}&p_from_date=${startDate}&p_to_date=${endDate}`);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
  }
};



export const  makeVasuli = () => {}
export const  sendLedgerNotiApi = () => {}
export const  markVyapariAllowedTransactions = () => {}
export const  sendAllLedgerNotiApi = () => {}