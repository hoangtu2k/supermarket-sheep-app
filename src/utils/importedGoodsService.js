import axios from "./axiosConfig";

const API_BASE = "/admin/imported-goods";

export const createEntryForm = (supplierId, userId, note) =>
  axios.post(`${API_BASE}/create-entry-form`, null, {
    params: { supplierId, userId, note },
  });

export const addProductToEntry = (entryFormId, productId, quantity, importPrice) =>
  axios.post(`${API_BASE}/add-product`, null, {
    params: { entryFormId, productId, quantity, importPrice },
  });

export const confirmEntry = (entryFormId) =>
  axios.post(`${API_BASE}/confirm-entry/${entryFormId}`);

export const fetchEntryFormDetails = (entryFormId) =>
  axios.get(`${API_BASE}/import-bill/${entryFormId}`);
