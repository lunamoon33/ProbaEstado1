import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import { getStatusInfo } from "../data/mock.js";
import { ReporteCard } from "../components/ReporteCard.jsx";
import { Filter, MapPin, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

const CATEGORIAS = ["Todos", "Infraestructura vial", "Alumbrado", "Residuos", "Señalización", "Otro"];

export function MapaPage() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("Todos");

  useEffect(() => {
    api.getReportes()
      .then(({ data }) => {
        setReportes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setReportes([]);
        setLoading(false);
      });
  }, []);

  const filtrados = filtro === "Todos"
    ? reportes
    : reportes.filter((r) => r.ia_categoria === filtro);

  const conCoordenadas = filtrados.filter(r => r.lat && r.lng);

  return (
    <div className="pt-14 flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 flex-shrink-0 bg-civic-surface border-r border-civic-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-civic-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-civic-text flex items-center gap-2">
              <Filter size={14} className="text-civic-accent" />
              Reportes ({filtrados.length})
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltro(cat)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  filtro === cat
                    ? "bg-civic-accent/20 border-civic-accent text-civic-accent"
                    : "border-civic-border text-civic-muted hover:border-civic-accent/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-2 border-b border-civic-border flex gap-4">
          <span className="flex items-center gap-1.5 text-xs text-civic-muted">
            <span className="w-2 h-2 rounded-full bg-[#FF3B5C]" /> Urgente
          </span>
          <span className="flex items-center gap-1.5 text-xs text-civic-muted">
            <span className="w-2 h-2 rounded-full bg-[#FFB800]" /> En revisión
          </span>
          <span className="flex items-center gap-1.5 text-xs text-civic-muted">
            <span className="w-2 h-2 rounded-full bg-[#00FF88]" /> Validado
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="text-civic-accent animate-spin" />
            </div>
          ) : filtrados.length === 0 ? (
            <p className="text-civic-muted text-sm text-center py-8">No hay reportes con ese filtro</p>
          ) : (
            filtrados.map((r, i) => <ReporteCard key={r._id || i} reporte={r} />)
          )}
        </div>
      </aside>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[-12.09, -77.04]}
          zoom={12}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OSM</a>'
          />
          {conCoordenadas.map((r, i) => {
            const status = getStatusInfo(r);
            return (
              <CircleMarker
                key={r._id || i}
                center={[r.lat, r.lng]}
                radius={10}
                pathOptions={{
                  color: status.color,
                  fillColor: status.color,
                  fillOpacity: 0.7,
                  weight: 2,
                }}
              >
                <Popup className="civic-popup">
                  <div className="bg-civic-card p-3 rounded-lg min-w-[200px]">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.badgeClass}`}>
                      {status.label}
                    </span>
                    <p className="text-xs text-civic-text mt-2 mb-1">{r.description || r.descripcion}</p>
                    <p className="text-xs text-civic-muted mb-2">{r.category || r.ia_categoria}</p>
                    <Link
                      to={`/reporte/${r._id || r.id}`}
                      className="text-xs text-civic-accent hover:underline flex items-center gap-1"
                    >
                      <MapPin size={10} /> Ver detalle
                    </Link>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        <div className="absolute bottom-4 right-4 z-[1000] flex gap-2">
          {[
            { label: "Total", val: reportes.length, color: "text-civic-text" },
            { label: "Urgentes", val: reportes.filter(r => r.status === "pending").length, color: "text-[#FF3B5C]" },
            { label: "Validados", val: reportes.filter(r => r.status === "verified").length, color: "text-civic-green" },
          ].map(({ label, val, color }) => (
            <div key={label} className="glass rounded-lg px-3 py-2 text-center min-w-[70px]">
              <p className={`text-lg font-bold font-mono ${color}`}>{val}</p>
              <p className="text-xs text-civic-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}