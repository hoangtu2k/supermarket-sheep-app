import axios from "./axiosConfig";

const API_BASE = "/admin/role";

export const roleService = {
    getAllRole: () => axios.get(API_BASE),
    getRoleById: (id) => axios.get(`${API_BASE}/${id}`),
    createRole: (role) => axios.post(API_BASE, role),
    updateRole: (id, role) => axios.put(`${API_BASE}/${id}`, role),
    deleteRole: (id) => axios.put(`${API_BASE}/${id}/status?status=0`),
    resetRole: (id) => axios.put(`${API_BASE}/${id}/status?status=1`)
};