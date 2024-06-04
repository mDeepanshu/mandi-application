import axios from 'axios';

export const submitKisanBill = async (post) => {
    try {
        const response = await axios.post('https://jsonplaceholder.typicode.com/posts', post);
        return response.data;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }    
  };