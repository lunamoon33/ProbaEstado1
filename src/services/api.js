import { REPORTES_MOCK } from "../data/mock.js";

// Cambia a false cuando el backend esté listo
// Si es false pero el backend falla, igual cae al mock automáticamente
const USE_MOCK = false;
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Mock de un reporte nuevo creado desde el formulario
const crearReporteMock = (form) => ({
  id: "rpt_" + Math.random().toString(36).slice(2, 8),
  pseudonimo: "ciudadano_anon",
  descripcion: form.description || form.descripcion || "",
  title: form.title || "",
  imagen_url: form.imagen_url || "https://picsum.photos/seed/nuevo/600/400",
  lat: form.lat || -12.077,
  lng: form.lng || -77.083,
  hash: "0x" + Array.from({ length: 40 }, () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join(""),
  link_verificable: "https://verify.civicapp.io/rpt_demo",
  qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://verify.civicapp.io/rpt_demo",
  status: "pending",
  ia_valido: true,
  ia_confianza: Math.floor(Math.random() * 20) + 75,
  ia_categoria: form.category || "Otro",
  blockchainHash: "0x" + Array.from({ length: 40 }, () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join(""),
  created_at: new Date().toISOString(),
});

export const api = {
  async getReportes(params = {}) {
    if (USE_MOCK) {
      await delay(400);
      return { data: REPORTES_MOCK };
    }
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/api/reports?${qs}`);
      if (!res.ok) throw new Error("Backend no disponible");
      return res.json();
    } catch {
      // Fallback automático al mock si el backend falla
      await delay(300);
      return { data: REPORTES_MOCK };
    }
  },

  async getReporte(id) {
    if (USE_MOCK) {
      await delay(400);
      const r = REPORTES_MOCK.find((r) => r.id === id);
      if (!r) throw new Error("Reporte no encontrado");
      return { data: r };
    }
    try {
      const res = await fetch(`${BASE_URL}/api/reports/${id}`);
      if (!res.ok) throw new Error("Backend no disponible");
      return res.json();
    } catch {
      // Fallback al mock
      await delay(300);
      const r = REPORTES_MOCK.find((r) => r.id === id);
      if (!r) throw new Error("Reporte no encontrado");
      return { data: r };
    }
  },

  async crearReporte(formData) {
    if (USE_MOCK) {
      await delay(1500); // simula procesamiento
      return { status: "success", data: crearReporteMock(formData) };
    }
    try {
      const res = await fetch(`${BASE_URL}/api/reports`, {
        method: "POST",
        body: formData, // FormData para soportar imagen
      });
      if (!res.ok) throw new Error("Backend no disponible");
      const data = await res.json();
      return data;
    } catch {
      // Fallback mock si el backend no está listo
      await delay(1500);
      const plain = {};
      if (formData instanceof FormData) {
        formData.forEach((v, k) => { plain[k] = v; });
      }
      return { status: "success", data: crearReporteMock(plain) };
    }
  },

  async verificarReporte(id) {
    if (USE_MOCK) {
      await delay(600);
      const r = REPORTES_MOCK.find((r) => r.id === id);
      if (!r) throw new Error("Reporte no encontrado");
      return { data: { ...r, verificado: true, blockchain: "zkSYS Testnet", chain_id: 57057 } };
    }
    try {
      const res = await fetch(`${BASE_URL}/api/v1/reportes/${id}/verificar`);
      if (!res.ok) throw new Error("Backend no disponible");
      return res.json();
    } catch {
      await delay(600);
      const r = REPORTES_MOCK.find((r) => r.id === id);
      if (!r) throw new Error("Reporte no encontrado");
      return { data: { ...r, verificado: true, blockchain: "zkSYS Testnet", chain_id: 57057 } };
    }
  },
};