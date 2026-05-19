export const REPORTES_MOCK = [
  {
    id: "rpt_7f3a91",
    pseudonimo: "ciudadano_42",
    descripcion: "Hueco grande en Av. Brasil, peligroso para motos",
    imagen_url: "https://picsum.photos/seed/rpt1/600/400",
    lat: -12.077,
    lng: -77.083,
    hash: "0x8F4A2C19E3B7D501A6F92847C3E1B5D20F8A3C7E",
    link_verificable: "https://verify.civicapp.io/rpt_7f3a91",
    qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://verify.civicapp.io/rpt_7f3a91",
    status: "validado",
    ia_valido: true,
    ia_confianza: 92,
    ia_categoria: "Infraestructura vial",
    created_at: "2025-01-15T14:32:00Z",
  },
  {
    id: "rpt_3b8e22",
    pseudonimo: "vecino_lima99",
    descripcion: "Poste de alumbrado apagado hace 3 semanas en Jr. Huallaga",
    imagen_url: "https://picsum.photos/seed/rpt2/600/400",
    lat: -12.045,
    lng: -77.031,
    hash: "0x3C7B1A9F2E4D8051B7C3A621E5F9D40C2B8E1A3F",
    link_verificable: "https://verify.civicapp.io/rpt_3b8e22",
    qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://verify.civicapp.io/rpt_3b8e22",
    status: "pending",
    ia_valido: true,
    ia_confianza: 78,
    ia_categoria: "Alumbrado",
    created_at: "2025-01-18T09:15:00Z",
  },
  {
    id: "rpt_9c1d54",
    pseudonimo: "reportero_miraflores",
    descripcion: "Acumulación de residuos en parque Kennedy sin recoger",
    imagen_url: "https://picsum.photos/seed/rpt3/600/400",
    lat: -12.121,
    lng: -77.029,
    hash: "0x1E5F8C2A7B4D3096E2A1B5C8F7D4E3B2A1C9F8E7",
    link_verificable: "https://verify.civicapp.io/rpt_9c1d54",
    qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://verify.civicapp.io/rpt_9c1d54",
    status: "validado",
    ia_valido: true,
    ia_confianza: 95,
    ia_categoria: "Residuos",
    created_at: "2025-01-19T16:45:00Z",
  },
  {
    id: "rpt_5a2f77",
    pseudonimo: "ciudadano_42",
    descripcion: "Semáforo dañado en intersección Av. Arequipa con Caminos del Inca",
    imagen_url: "https://picsum.photos/seed/rpt4/600/400",
    lat: -12.108,
    lng: -77.013,
    hash: "0xA2C4E6F8B1D3050769A2C4E6F8B1D30507692468",
    link_verificable: "https://verify.civicapp.io/rpt_5a2f77",
    qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://verify.civicapp.io/rpt_5a2f77",
    status: "validado",
    ia_valido: true,
    ia_confianza: 88,
    ia_categoria: "Señalización",
    created_at: "2025-01-20T11:22:00Z",
  },
  {
    id: "rpt_2e9b13",
    pseudonimo: "vecina_sjm",
    descripcion: "Alcantarilla rota inunda la calle en épocas de lluvia",
    imagen_url: "https://picsum.photos/seed/rpt5/600/400",
    lat: -12.156,
    lng: -76.974,
    hash: "0x7D9B2E4F1A3C5870B9D2E4F1A3C58703D9B2E4F1",
    link_verificable: "https://verify.civicapp.io/rpt_2e9b13",
    qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://verify.civicapp.io/rpt_2e9b13",
    status: "pending",
    ia_valido: true,
    ia_confianza: 71,
    ia_categoria: "Infraestructura vial",
    created_at: "2025-01-21T08:05:00Z",
  },
];

export const getStatusInfo = (reporte) => {
  if (reporte.ia_confianza >= 85 && reporte.status !== "validado") {
    return { label: "Urgente", color: "#FF3B5C", badgeClass: "badge-urgente" };
  }
  if (reporte.status === "validado") {
    return { label: "Validado", color: "#00FF88", badgeClass: "badge-validado" };
  }
  if (reporte.status === "pending") {
    return { label: "En revisión", color: "#FFB800", badgeClass: "badge-revision" };
  }
  return { label: "Pendiente", color: "#64748B", badgeClass: "badge-pendiente" };
};

// --- Monitoreo de medios (recolección de APIs externas) ---
export const MEDIOS_MOCK = [
  {
    id: "med_01",
    fuente: "Twitter/X",
    texto: "Enorme hueco en Av. Javier Prado lleva semanas sin atención, peligro para vehículos",
    url: "https://twitter.com/example/status/1",
    fecha: "2025-01-21T08:30:00Z",
    distrito: "San Isidro",
    categoria: "Infraestructura vial",
    menciones: 47,
    verificado_blockchain: false,
  },
  {
    id: "med_02",
    fuente: "Facebook",
    texto: "Vecinos de Miraflores denuncian acumulación de basura en parque hace 5 días",
    url: "https://facebook.com/example/post/1",
    fecha: "2025-01-20T14:15:00Z",
    distrito: "Miraflores",
    categoria: "Residuos",
    menciones: 123,
    verificado_blockchain: false,
  },
  {
    id: "med_03",
    fuente: "El Comercio",
    texto: "Alumbrado público apagado en zona residencial de Pueblo Libre genera inseguridad",
    url: "https://elcomercio.pe/example",
    fecha: "2025-01-19T11:00:00Z",
    distrito: "Pueblo Libre",
    categoria: "Alumbrado",
    menciones: 89,
    verificado_blockchain: false,
  },
  {
    id: "med_04",
    fuente: "TikTok",
    texto: "Video viral: semáforo roto en esquina peligrosa de Surco sin arreglar",
    url: "https://tiktok.com/@example/video/1",
    fecha: "2025-01-21T10:00:00Z",
    distrito: "Surco",
    categoria: "Señalización",
    menciones: 312,
    verificado_blockchain: false,
  },
  {
    id: "med_05",
    fuente: "RPP Noticias",
    texto: "Alcantarilla colapsada en San Juan de Miraflores inunda calles con lluvia",
    url: "https://rpp.pe/example",
    fecha: "2025-01-18T16:45:00Z",
    distrito: "San Juan de Miraflores",
    categoria: "Infraestructura vial",
    menciones: 201,
    verificado_blockchain: false,
  },
];

// --- Dashboard ciudadano mock ---
export const CIUDADANO_MOCK = {
  pseudonimo: "ciudadano_42",
  puntos: 340,
  nivel: "Verificador Activo",
  creditos_ganados: 12.5,
  reportes_enviados: 8,
  reportes_validados: 6,
  reportes_rechazados: 1,
  reportes: ["rpt_7f3a91", "rpt_5a2f77"],
};

// --- Tiers de acceso ---
export const TIERS = {
  publico: { label: "Público", color: "text-civic-muted" },
  ciudadano: { label: "Ciudadano", color: "text-civic-accent" },
  institucional: { label: "Institucional", color: "text-civic-green" },
};

// Clasificación de contenido por Gemini
export const CONTENT_LEVELS = {
  safe: {
    label: "Apto",
    color: "text-civic-green",
    badge: "badge-validado",
    descripcion: "Contenido apto para todos"
  },
  restricted: {
    label: "Solo institucional",
    color: "text-[#FFB800]",
    badge: "badge-revision", 
    descripcion: "Contenido sensible — solo cuentas verificadas"
  },
  blocked: {
    label: "Bloqueado",
    color: "text-[#FF3B5C]",
    badge: "badge-urgente",
    descripcion: "Reporte rechazado automáticamente"
  },
};

// Placeholder images por categoría (reemplazan foto real en vista pública)
export const PLACEHOLDERS = {
  "Infraestructura vial": "https://picsum.photos/seed/road/600/400",
  "Alumbrado": "https://picsum.photos/seed/light/600/400",
  "Residuos": "https://picsum.photos/seed/waste/600/400",
  "Señalización": "https://picsum.photos/seed/sign/600/400",
  "Otro": "https://picsum.photos/seed/other/600/400",
};
