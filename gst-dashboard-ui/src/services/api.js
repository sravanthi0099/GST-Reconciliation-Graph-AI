import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getSummary = async () => {
  const res = await api.get("/api/reconciliation/summary");
  return res.data;
};

export const getVendorRiskScores = async () => {
  const res = await api.get("/api/vendors/risk-scores");
  return res.data;
};

export const getAuditHighRisk = async () => {
  const res = await api.get("/audit/high-risk");
  return res.data;
};

export const getNetworkExposure = async (gstin) => {
  const res = await api.get(`/network/exposure/${gstin}`);
  return res.data;
};

export default api;
