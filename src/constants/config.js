const config = {
  // apiBaseUrl: 'http://52.66.145.64:8080/mandi-dev/',
  apiBaseUrl: process.env.REACT_APP_API_URL,
};

export const dateTimeFormat = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Asia/Kolkata', 
};

export const dateFormat = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'Asia/Kolkata', 
};


export default config;
