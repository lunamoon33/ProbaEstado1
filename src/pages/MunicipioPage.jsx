import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import { getStatusInfo } from "../data/mock.js";
import { BarChart2, AlertTriangle, CheckCircle, Clock, TrendingUp, Loader2 } from "lucide-react";

export function MunicipioPage() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("todos");

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

  const stats = {
    total: reportes.length,
    urgentes: reportes.filter(r => r.ia_confianza >= 85 && r.status !== "validado").length,
    validados: reportes.filter(r => r.status === "validado").length,
    pendientes: reportes.filter(r => r.status === "pending").length,
  };

  const categoriaCount = reportes.reduce((acc, r) => {
    acc[r.ia_categoria] = (acc[r.ia_categoria] || 0) + 1;
    return acc;
  }, {});

  const filtrados = filtroStatus === "todos"
    ? reportes
    : reportes.filter(r => {
        if (filtroStatus === "urgentes") return r.ia_confianza >= 85 && r.status !== "validado";
        return r.status === filtroStatus;
      });

  if (loading) return (
    <div className="pt-14 flex items-center justify-center min-h-screen">
      <Loader2 size={32} className="text-civic-accent animate-spin" />
    </div>
  );

  return (
    <div className="pt-14 min-h-screen bg-civic-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-civic-text flex items-center gap-2">
              <BarChart2 size={22} className="text-civic-accent" />
              Dashboard Municipal
            </h1>
            <p className="text-civic-muted text-sm mt-0.5">Vista general de reportes ciudadanos verificados</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-civic-muted">
            <div className="w-2 h-2 rounded-full bg-civic-green animate-pulse" />
            En tiempo real
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total reportes", val: stats.total, icon: TrendingUp, color: "text-civic-accent", bg: "bg-civic-accent/10 border-civic-accent/20" },
            { label: "Urgentes", val: stats.urgentes, icon: AlertTriangle, color: "text-[#FF3B5C]", bg: "bg-[#FF3B5C]/10 border-[#FF3B5C]/20" },
            { label: "Validados", val: stats.validados, icon: CheckCircle, color: "text-civic-green", bg: "bg-civic-green/10 border-civic-green/20" },
            { label: "En revisión", val: stats.pendientes, icon: Clock, color: "text-[#FFB800]", bg: "bg-[#FFB800]/10 border-[#FFB800]/20" },
          ].map(({ label, val, icon: Icon, color, bg }) => (
            <div key={label} className={`bg-civic-card border rounded-xl p-5 ${bg}`}>
              <div className="flex items-center justify-between mb-2">
                <Icon size={16} className={color} />
                <span className={`text-3xl font-bold font-mono ${color}`}>{val}</span>
              </div>
              <p className="text-xs text-civic-muted">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Categorías */}
          <div className="bg-civic-card border border-civic-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-civic-text mb-4">Por categoría</h3>
            <div className="space-y-3">
              {Object.entries(categoriaCount).map(([cat, count]) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-civic-muted">{cat}</span>
                      <span className="text-civic-text font-mono">{count}</span>
                    </div>
                    <div className="h-1.5 bg-civic-border rounded-full">
                      <div
                        className="h-1.5 bg-civic-accent rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabla reportes */}
          <div className="md:col-span-2 bg-civic-card border border-civic-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-civic-text">Reportes recientes</h3>
              <div className="flex gap-1.5">
                {["todos", "urgentes", "validado", "pending"].map(f => (
                  <button
                    key={f}
                    onClick={() => setFiltroStatus(f)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      filtroStatus === f
                        ? "bg-civic-accent/20 border-civic-accent text-civic-accent"
                        : "border-civic-border text-civic-muted hover:border-civic-accent/30"
                    }`}
                  >
                    {f === "pending" ? "revisión" : f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {filtrados.length === 0 ? (
                <p className="text-civic-muted text-sm text-center py-6">No hay reportes</p>
              ) : (
                filtrados.map(r => {
                  const status = getStatusInfo(r);
                  const fecha = new Date(r.created_at).toLocaleDateString("es-PE", {
                    day: "numeric", month: "short"
                  });
                  return (
                    <Link
                      key={r.id}
                      to={`/reporte/${r.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-civic-bg hover:bg-civic-surface transition-colors border border-transparent hover:border-civic-border"
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: status.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-civic-text truncate">{r.descripcion}</p>
                        <p className="text-xs text-civic-muted">{r.ia_categoria}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-mono text-civic-muted">{r.ia_confianza}%</p>
                        <p className="text-xs text-civic-muted">{fecha}</p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
