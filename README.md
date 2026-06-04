#Proba Estado— Frontend

Dashboard ciudadano para reportes verificados en blockchain.

## Stack
- React + Vite
- Tailwind CSS v3
- React Router DOM
- Leaflet (mapas)
- Lucide React (iconos)

## Páginas
| Ruta | Vista |
|---|---|
| `/` | Mapa con todos los reportes + sidebar con filtros |
| `/reporte/:id` | Detalle con foto, hash, QR, score IA |
| `/verificar/:id` | Verificación pública (sin navbar) |
| `/municipio` | Dashboard con stats y tabla de reportes |

## Conectar al backend
1. Copiar `.env.example` → `.env`
2. Setear `VITE_API_URL=http://tu-backend`
3. En `src/services/api.js` cambiar `USE_MOCK = false`

## Correr en local
```bash
npm install
npm run dev
```

## Red blockchain
- zkSYS Testnet = zkTanenbaum
- Chain ID: 57057
- Explorer: https://explorer-zk.tanenbaum.io

echo 'MIT License

Copyright (c) 2026 ProbaEstado

Permission is hereby granted, free of charge, to any person obtaining a copy of this software.' >> README.md && git add . && git commit -m "docs: licencia MIT" && git push
