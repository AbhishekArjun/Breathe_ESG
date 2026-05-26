import axios from 'axios';

const API_URL = 'https://breathe-esg-ytc6.onrender.com/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getClients = () => api.get('clients/');
export const getDataSources = () => api.get('data-sources/');
export const getIngestionJobs = () => api.get('ingestion-jobs/');
export const uploadData = (dataSourceId, file) => {
  const formData = new FormData();
  formData.append('data_source_id', dataSourceId);
  formData.append('file', file);
  return axios.post(`${API_URL}ingestion-jobs/upload/`, formData);
};
export const getRecords = () => api.get('records/');
export const approveRecord = (id, user) => api.post(`records/${id}/approve/`, { user });
export const rejectRecord = (id, user, notes) => api.post(`records/${id}/reject/`, { user, notes });

export default api;
