import axios from "./axiosConfig";

const API_BASE = "/admin/users";

export const userService = {
  getAllUser: () => axios.get(API_BASE),
  getUserById: (id) => axios.get(`${API_BASE}/${id}`),
  createUser: (user) => axios.post(API_BASE, user),
  updateUser: (id, user) => axios.put(`${API_BASE}/${id}`, user),
  deleteUser: (id) => axios.put(`${API_BASE}/${id}/status?status=INACTIVE`),
  resetUser: (id) => axios.put(`${API_BASE}/${id}/status?status=ACTIVE`)
};