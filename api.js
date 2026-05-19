// TODO: cambiar USE_MOCK a false cuando el backend esté listo
const USE_MOCK = true;
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

import { REPORTES_MOCK } from "../data/mock.js";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const api = {
  async getReportes(params = {}) {
    if (USE_MOCK) {
      await delay(400);
      return { data: REPORTES_MOCK };
    }
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/api/v1/reportes?${qs}`);
    return res.json();
  },

  async getReporte(id) {
    if (USE_MOCK) {
      await delay(300);
      const r = REPORTES_MOCK.find((r) => r.id === id);
      if (!r) throw new Error("Reporte no encontrado");
      return { data: r };
    }
    const res = await fetch(`${BASE_URL}/api/v1/reportes/${id}`);
    return res.json();
  },

  async verificarReporte(id) {
    if (USE_MOCK) {
      await delay(600);
      const r = REPORTES_MOCK.find((r) => r.id === id);
      if (!r) throw new Error("Reporte no encontrado");
      return { data: { ...r, verificado: true, blockchain: "zkSYS Testnet", chain_id: 57057 } };
    }
    const res = await fetch(`${BASE_URL}/api/v1/reportes/${id}/verificar`);
    return res.json();
  },
};
