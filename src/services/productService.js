import axios from "./axiosConfig";

const API_BASE = "/admin/products";

export const productService = {
    getAllProducts: () => axios.get(API_BASE),
    getProductById: (id) => axios.get(`${API_BASE}/${id}`),
    createProduct: (product) => axios.post(API_BASE, product),
    updateProduct: (id, product) => axios.put(`${API_BASE}/${id}`, product),
    deleteProduct:  (id) => axios.put(`${API_BASE}/${id}/status?status=0`),
    resetProduct:  (id) => axios.put(`${API_BASE}/${id}/status?status=1`)
};