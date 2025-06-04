import axios from "./axiosConfig";

const API_BASE = "/bill";

export const sellService = {
  submitOrder: async (orderData) => {
    try {
      const response = await axios.post(`${API_BASE}/thanhtoantructiep`, orderData);
      return response;
    } catch (error) {
      console.error("Error submitting order:", error);
      throw error;
    }
  },
};