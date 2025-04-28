import axios from "./axiosConfig";

const API_BASE = "/admin/supplier";

export const supplierService = {
        getAllSupplier: () => axios.get(API_BASE),
        getSupplierById: (id) => axios.get(`${API_BASE}/${id}`),
        createSupplier: (supplier) => axios.post(API_BASE, supplier),
        updateSupplier: (id, supplier) => axios.put(`${API_BASE}/${id}`, supplier),
        deleteSupplier: (id) => axios.put(`${API_BASE}/${id}/status?status=0`),
        resetSupplier: (id) => axios.put(`${API_BASE}/${id}/status?status=1`)
};