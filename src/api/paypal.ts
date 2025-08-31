import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const createSubscription = async (planId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/create-subscription`, {
      planId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};
