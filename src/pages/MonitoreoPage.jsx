import { useState, useEffect } from "react";
import { Rss, ExternalLink, TrendingUp, AlertTriangle, Info, RefreshCw } from "lucide-react";
import { getNoticias } from "../services/noticiaService";

const CAT_LABELS = {
  accidente: "Accidente",
  incendio: "Incendio",
  delito: "Seguridad",
  trafico: "Tráfico",
  otro: "General",
};

const CAT_ICONS = {
  accidente: "🚗",
  incendio: "🔥",
  delito: "🚨",
  trafico: "🚦",
  otro: "📍",
};

const CATEGORIAS = ["Todas", "accidente", "incendio", "delito", "trafico", "otro"];

export function MonitoreoPage() {
  const [noticias, setNoticias] = useState([]);
  const [filtro, setFiltro] = useState("Todas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [ultimaAct, setUltimaAct] = useState(null);

  async function cargar() {
    setLoading(true);
    setError(false);
    try {
      const data = await getNoticias();
      setNoticias(data);
      setUltimaAct(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 5 * 60 * 1000); // refresca cada 5 min
    return () => clearInterval(interval);
  }, []);

  const filtrados = filtro === "Todas"
    ? noticias
    : noticias.filter(n => n.cat === filtro);

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
              Noticias en tiempo real de Lima — RPP Noticias
            </p>
          </div>
          <div className="flex items-center gap-3">
            {ultimaAct && (
              <span className="text-xs text-civic-muted">
                Actualizado {ultimaAct.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={cargar}
              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-lg text-[#FFB800] hover:bg-[#FFB800]/20 transition-all"
            >
              <RefreshCw size={12} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Aviso */}
        <div className="flex items-start gap-3 p-4 bg-civic-surface border border-civic-border rounded-xl mb-6">
          <Info size={16} className="text-civic-muted mt-0.5 flex-shrink-0" />
          <p className="text-xs text-civic-muted leading-relaxed">
            Estas noticias son señales recolectadas automáticamente de RPP.
            <span className="text-[#FFB800]"> No tienen certificado blockchain</span> y no son evidencia verificable.
            Para generar un reporte con credencial en zkSYS, usa el bot de Discord.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIAS.map(cat => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                filtro === cat
                  ? "bg-[#FFB800]/20 border-[#FFB800] text-[#FFB800]"
                  : "border-civic-border text-civic-muted hover:border-[#FFB800]/40"
              }`}
            >
              {cat === "Todas" ? "Todas" : `${CAT_ICONS[cat]} ${CAT_LABELS[cat]}`}
            </button>
          ))}
        </div>

        {/* Estado */}
        {loading && (
          <div className="text-center py-12 text-civic-muted text-sm">
            Recolectando noticias de Lima...
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12 text-civic-muted text-sm">
            No se pudo cargar. Verifica tu conexión.{" "}
            <button onClick={cargar} className="text-civic-accent underline ml-1">
              Reintentar
            </button>
          </div>
        )}

        {/* Lista */}
        {!loading && !error && (
          <div className="space-y-3">
            {filtrados.length === 0 ? (
              <div className="text-center py-12 text-civic-muted text-sm">
                No hay noticias para este filtro.
              </div>
            ) : filtrados.map((n, i) => {
              const fecha = n.pubDate
                ? new Date(n.pubDate).toLocaleString("es-PE", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })
                : "";
              return (
                <div
                  key={i}
                  className="bg-civic-card border border-civic-border rounded-xl p-4 hover:border-[#FFB800]/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs bg-civic-surface border border-civic-border px-2 py-0.5 rounded text-civic-muted">
                          📻 RPP Noticias
                        </span>
                        <span className="text-xs text-civic-muted bg-civic-surface border border-civic-border px-2 py-0.5 rounded">
                          {CAT_ICONS[n.cat]} {CAT_LABELS[n.cat]}
                        </span>
                      </div>
                      <p className="text-sm text-civic-text leading-relaxed mb-2">
                        {n.titulo}
                      </p>
                      {n.desc && (
                        <p className="text-xs text-civic-muted leading-relaxed mb-2">
                          {n.desc.slice(0, 140)}{n.desc.length > 140 ? "…" : ""}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-civic-muted">
                        {fecha && <span>{fecha}</span>}
                        <span className="flex items-center gap-1 text-[#FFB800]">
                          <AlertTriangle size={11} />
                          Sin certificado
                        </span>
                      </div>
                    </div>
                    <a
                      href={n.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 hover:text-civic-accent text-civic-muted transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>

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
        )}
      </div>
    </div>
  );
}