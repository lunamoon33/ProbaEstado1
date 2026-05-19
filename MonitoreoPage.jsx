import { useState, useEffect } from "react";
import { Rss, ExternalLink, TrendingUp, AlertTriangle, Info } from "lucide-react";
import { MEDIOS_MOCK } from "../data/mock.js";

const FUENTES = ["Todas", "Twitter/X", "Facebook", "TikTok", "El Comercio", "RPP Noticias"];
const FUENTE_ICONS = {
  "Twitter/X": "🐦",
  "Facebook": "📘",
  "TikTok": "🎵",
  "El Comercio": "📰",
  "RPP Noticias": "📻",
};

export function MonitoreoPage() {
  const [medios, setMedios] = useState([]);
  const [filtro, setFiltro] = useState("Todas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setMedios(MEDIOS_MOCK);
      setLoading(false);
    }, 500);
  }, []);

  const filtrados = filtro === "Todas"
    ? medios
    : medios.filter(m => m.fuente === filtro);

  const totalMenciones = medios.reduce((acc, m) => acc + m.menciones, 0);

  return (
    <div className="pt-14 min-h-screen bg-civic-bg">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-civic-text flex items-center gap-2">
              <Rss size={22} className="text-civic-yellow" />
              Monitoreo de medios
            </h1>
            <p className="text-civic-muted text-sm mt-0.5">
              Señales recolectadas de redes sociales y medios — sin certificado blockchain
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-lg">
            <TrendingUp size={14} className="text-[#FFB800]" />
            <span className="text-xs text-[#FFB800] font-medium">{totalMenciones} menciones hoy</span>
          </div>
        </div>

        {/* Aviso importante */}
        <div className="flex items-start gap-3 p-4 bg-civic-surface border border-civic-border rounded-xl mb-6">
          <Info size={16} className="text-civic-muted mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-civic-muted leading-relaxed">
              Estos reportes son señales recolectadas automáticamente de redes y medios. 
              <span className="text-[#FFB800]"> No tienen certificado blockchain</span> y no son evidencia verificable. 
              Para generar un reporte con credencial en zkSYS, usa el bot de Discord.
            </p>
          </div>
        </div>

        {/* Filtros por fuente */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FUENTES.map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                filtro === f
                  ? "bg-[#FFB800]/20 border-[#FFB800] text-[#FFB800]"
                  : "border-civic-border text-civic-muted hover:border-[#FFB800]/40"
              }`}
            >
              {f !== "Todas" && FUENTE_ICONS[f] + " "}{f}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-civic-muted text-sm">Recolectando señales...</div>
          ) : filtrados.map(m => {
            const fecha = new Date(m.fecha).toLocaleString("es-PE", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
            });
            return (
              <div
                key={m.id}
                className="bg-civic-card border border-civic-border rounded-xl p-4 hover:border-[#FFB800]/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs bg-civic-surface border border-civic-border px-2 py-0.5 rounded text-civic-muted">
                        {FUENTE_ICONS[m.fuente]} {m.fuente}
                      </span>
                      <span className="text-xs text-civic-muted bg-civic-surface border border-civic-border px-2 py-0.5 rounded">
                        {m.categoria}
                      </span>
                      <span className="text-xs text-civic-muted">
                        📍 {m.distrito}
                      </span>
                    </div>
                    <p className="text-sm text-civic-text leading-relaxed mb-2">
                      {m.texto}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-civic-muted">
                      <span>{fecha}</span>
                      <span className="flex items-center gap-1">
                        <TrendingUp size={11} />
                        {m.menciones} menciones
                      </span>
                      <span className="flex items-center gap-1 text-[#FFB800]">
                        <AlertTriangle size={11} />
                        Sin certificado
                      </span>
                    </div>
                  </div>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-2 hover:text-civic-accent text-civic-muted transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>

                {/* CTA para convertir en reporte real */}
                <div className="mt-3 pt-3 border-t border-civic-border flex items-center justify-between">
                  <p className="text-xs text-civic-muted">
                    ¿Tienes evidencia de este incidente?
                  </p>
                  <button className="text-xs text-civic-accent hover:underline flex items-center gap-1">
                    Reportar con certificado →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
