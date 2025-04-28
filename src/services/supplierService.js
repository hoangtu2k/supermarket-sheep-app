import axios from "./axiosConfig";

const API_BASE = "/admin/supplier";

export const supplierService = {
        getAllSupplier: () => axios.get(API_BASE),
};