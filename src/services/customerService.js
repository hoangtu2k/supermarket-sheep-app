import axios from "./axiosConfig";

const API_BASE = "/admin/customers";

export const customerService = {
    getAllCustomers: () => axios.get(API_BASE),
    getCustomersByStatus: (status) => axios.get(`${API_BASE}/filter?status=${status}`),
    getCustomerById: (id) => axios.get(`${API_BASE}/${id}`),
    createCustomer: (role) => axios.post(API_BASE, role),
    updateCustomer: (id, role) => axios.put(`${API_BASE}/${id}`, role),
    deleteCustomer: (id) => axios.put(`${API_BASE}/${id}/status?status=INACTIVE`),
    resetCustomer: (id) => axios.put(`${API_BASE}/${id}/status?status=ACTIVE`)
};