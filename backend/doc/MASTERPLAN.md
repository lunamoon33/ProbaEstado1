# MASTERPLAN.md — Plan Técnico General

## Arquitectura del sistema

```
[Discord Bot]
     │
     │  POST /api/v1/reportes
     ▼
[Backend FastAPI]
     │
     ├──► [Gemini Vision] → valida imagen → retorna score + categoría
     ├──► [Cloudinary]    → almacena imagen → retorna URL
     ├──► [SHA-256]       → genera hash del reporte
     ├──► [zkSYS]         → registra hash on-chain → retorna tx hash
     └──► [PostgreSQL]    → guarda reporte completo
     │
     │  JSON response
     ▼
[Discord Bot] → muestra hash + QR + link verificable al usuario
     
[Frontend React]
     │
     ├──► GET /api/v1/reportes → mapa con todos los reportes
     ├──► GET /api/v1/reportes/:id → detalle con hash y QR
     └──► GET /api/v1/reportes/:id/verificar → verificación pública
```

---

## Stack tecnológico

| Capa | Tecnología | Responsable |
|---|---|---|
| Bot Discord | Python + discord.py | Miriam (coding) |
| IA visión | Gemini Vision API (gemini-1.5-pro) | Miriam (coding) |
| Backend | FastAPI (Python) | Fullstack |
| Base de datos | Supabase (PostgreSQL + PostGIS) | Fullstack |
| Almacenamiento | Cloudinary (free tier) | Fullstack |
| Blockchain | zkSYS / zkTanenbaum (Chain ID 57057) | Fullstack |
| Frontend | React + Vite + Tailwind | Fullstack |
| Mapas | Leaflet + react-leaflet | Fullstack |
| Hosting bot | Railway | Miriam (coding) |
| Hosting web | Vercel | Fullstack |

---

## Contrato de integración Bot ↔ Backend

### Bot envía:
```json
POST /api/v1/reportes
{
  "foto_base64": "data:image/jpeg;base64,...",
  "lat": -12.07,
  "lng": -77.08,
  "descripcion": "Hueco en Av. Brasil",
  "pseudonimo": "ciudadano_42"
}
```

### Backend responde:
```json
HTTP 200 OK
{
  "reporte_id": "rpt_7f3a91",
  "hash": "0x8F4A...B92C",
  "link_verificable": "https://verify.civicapp.io/rpt_7f3a91",
  "qr_url": "https://api.civicapp.io/qr/rpt_7f3a91.png",
  "status": "validado",
  "confianza_ia": 91
}
```

### Errores:
| HTTP | Significado | Mensaje al usuario |
|---|---|---|
| 400 | Faltan campos | "Tu reporte no pudo enviarse. Verifica la foto." |
| 422 | IA rechazó imagen | "La foto no muestra un incidente válido." |
| 503 | Backend / zkSYS caído | "Servicio no disponible. Intenta en unos minutos." |

---

## Endpoints del backend

| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/v1/reportes | Crear reporte + validar IA + registrar hash |
| GET | /api/v1/reportes | Listar reportes con filtros |
| GET | /api/v1/reportes/:id | Detalle de un reporte |
| GET | /api/v1/reportes/:id/verificar | Verificación pública sin auth |
| GET | /api/v1/usuarios/:id/puntos | Reputación del ciudadano |

---

## Flujo del bot (comandos Discord)

```
/reportar
  1. Usuario adjunta foto
  2. Bot extrae GPS del EXIF (piexif)
  3. Si no hay GPS → bot pide ubicación en texto
  4. Bot envía POST al backend
  5. Bot muestra embed con hash + QR + link

/mistatus
  → Muestra reportes del seudónimo + puntos acumulados

/validar [id]
  → Solo para validadores: marcar reporte como real o falso
```

---

## Sistema de reputación

| Acción | Puntos |
|---|---|
| Reporte validado por IA (confianza ≥ 80%) | +10 |
| Reporte confirmado por validador humano | +20 |
| Reporte rechazado por IA | -5 |
| Contenido bloqueado (violencia, rostros) | -15 |
| Institución compra datos del reporte | % en SYS |

---

## Base de datos (esquema principal)

```sql
CREATE TABLE reportes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pseudonimo    TEXT NOT NULL,
  descripcion   TEXT NOT NULL,
  imagen_url    TEXT NOT NULL,
  ubicacion     GEOMETRY(Point, 4326),
  hash          TEXT UNIQUE NOT NULL,
  link_public   TEXT,
  qr_url        TEXT,
  ia_valido     BOOLEAN DEFAULT false,
  ia_confianza  INTEGER,
  ia_categoria  TEXT,
  status        TEXT DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE usuarios (
  pseudonimo    TEXT PRIMARY KEY,
  puntos        INTEGER DEFAULT 0,
  reportes_ok   INTEGER DEFAULT 0,
  reportes_mal  INTEGER DEFAULT 0
);
```

---

## Plan de trabajo hackathon (48h)

### Día 1 — Flujo funcional de punta a punta
- [ ] Bot básico: comando /reportar, recibe foto
- [ ] Extracción GPS del EXIF
- [ ] POST al backend (mock al inicio)
- [ ] Backend: endpoint POST /reportes
- [ ] Integración Gemini Vision
- [ ] Hash SHA-256 + Supabase

### Día 2 — UI, blockchain y demo
- [ ] Embed Discord con QR y link verificable
- [ ] Manejo de errores (422, 503)
- [ ] Integración zkSYS (o fallback hash simulado)
- [ ] Dashboard: mapa + cards de reportes
- [ ] Vista verificación pública
- [ ] Demo final

---

## Plan B si zkSYS no está listo

```python
credential_id = "0x" + sha256(hash + timestamp)[:10]
verified = True  # flag en DB
```

El jurado valora la arquitectura. Si zkSYS no está listo, se muestra el flujo completo con hash local y se explica en el pitch.

---

## Red blockchain

- **Red:** zkSYS Testnet = zkTanenbaum
- **Chain ID:** 57057
- **RPC:** https://rpc-zk.tanenbaum.io
- **Explorer:** https://explorer-zk.tanenbaum.io