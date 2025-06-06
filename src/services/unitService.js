import axios from "./axiosConfig";

const API_BASE = "/admin/units";

export const unitService = {
  getAllUnit: () => axios.get(API_BASE),
  getUnitById: (id) => axios.get(`${API_BASE}/${id}`),
  createUnit: (unit) => axios.post(API_BASE, unit),
  updateUnit: (id, unit) => axios.put(`${API_BASE}/${id}`, unit),
  deleteUnit: (id) => axios.put(`${API_BASE}/${id}/status?status=INACTIVE`),
  resetUnit: (id) => axios.put(`${API_BASE}/${id}/status?status=ACTIVE`)
};