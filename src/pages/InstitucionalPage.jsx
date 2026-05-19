import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Download, Eye, EyeOff, Lock, Shield, MapPin, Brain, Filter } from "lucide-react";
import { REPORTES_MOCK, getStatusInfo } from "../data/mock.js";

// Simula que el usuario institucional está autenticado
const INSTITUCION_MOCK = {
  nombre: "Municipalidad de San Isidro",
  tier: "institucional",
  reportes_accedidos: 23,
  gasto_mes: 145.50,
};

export function InstitucionalPage() {
  const [mostrarFoto, setMostrarFoto] = useState({});
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const toggleFoto = (id) => setMostrarFoto(prev => ({ ...prev, [id]: !prev[id] }));

  const filtrados = filtroStatus === "todos"
    ? REPORTES_MOCK
    : REPORTES_MOCK.filter(r => r.status === filtroStatus);

  return (
    <div className="pt-14 min-h-screen bg-civic-bg">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header institucional */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={18} className="text-civic-green" />
              <span className="text-xs font-semibold text-civic-green bg-civic-green/10 border border-civic-green/30 px-2.5 py-1 rounded-full">
                Acceso institucional
              </span>
            </div>
            <h1 className="text-2xl font-bold text-civic-text">{INSTITUCION_MOCK.nombre}</h1>
            <p className="text-civic-muted text-sm mt-0.5">
              Panel completo — fotos, seudónimos y ubicaciones aproximadas incluidas
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-civic-card border border-civic-border rounded-xl px-4 py-3 text-center">
              <p className="text-xl font-bold font-mono text-civic-text">{INSTITUCION_MOCK.reportes_accedidos}</p>
              <p className="text-xs text-civic-muted">accesos este mes</p>
            </div>
            <div className="bg-civic-card border border-civic-border rounded-xl px-4 py-3 text-center">
              <p className="text-xl font-bold font-mono text-[#FFB800]">S/{INSTITUCION_MOCK.gasto_mes.toFixed(2)}</p>
              <p className="text-xs text-civic-muted">consumo este mes</p>
            </div>
          </div>
        </div>

        {/* Aviso de privacidad */}
        <div className="flex items-start gap-3 p-4 bg-civic-green/5 border border-civic-green/20 rounded-xl mb-6">
          <Shield size={15} className="text-civic-green mt-0.5 flex-shrink-0" />
          <p className="text-xs text-civic-muted leading-relaxed">
            Como institución verificada tienes acceso a fotografías, ubicaciones aproximadas y seudónimos.
            <span className="text-civic-green"> Cada acceso a datos detallados genera un crédito SYS para el ciudadano reportero.</span>
            {" "}El uso está regulado bajo el marco legal peruano de protección de datos.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 mb-5">
          <Filter size={14} className="text-civic-muted" />
          <div className="flex gap-2 flex-wrap">
            {["todos", "validado", "pending"].map(f => (
              <button
                key={f}
                onClick={() => setFiltroStatus(f)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  filtroStatus === f
                    ? "bg-civic-accent/20 border-civic-accent text-civic-accent"
                    : "border-civic-border text-civic-muted hover:border-civic-accent/30"
                }`}
              >
                {f === "pending" ? "En revisión" : f === "todos" ? "Todos" : "Validados"}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla institucional */}
        <div className="space-y-4">
          {filtrados.map(r => {
            const status = getStatusInfo(r);
            const fotoVisible = mostrarFoto[r.id];
            const fecha = new Date(r.created_at).toLocaleString("es-PE", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
            });

            return (
              <div
                key={r.id}
                className="bg-civic-card border border-civic-border rounded-xl overflow-hidden hover:border-civic-green/30 transition-all"
              >
                <div className="flex gap-4 p-4">

                  {/* Foto — toggle visible/oculta */}
                  <div className="relative flex-shrink-0 w-24 h-24">
                    {fotoVisible ? (
                      <img
                        src={r.imagen_url}
                        alt="evidencia"
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-civic-bg border border-civic-border flex flex-col items-center justify-center gap-1">
                        <Lock size={16} className="text-civic-muted" />
                        <span className="text-xs text-civic-muted">Foto</span>
                      </div>
                    )}
                    <button
                      onClick={() => toggleFoto(r.id)}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-civic-surface border border-civic-border flex items-center justify-center hover:border-civic-accent/40 transition-all"
                      title={fotoVisible ? "Ocultar foto" : "Ver foto (genera crédito al reportero)"}
                    >
                      {fotoVisible
                        ? <EyeOff size={10} className="text-civic-muted" />
                        : <Eye size={10} className="text-civic-accent" />
                      }
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.badgeClass}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-civic-muted bg-civic-bg border border-civic-border px-2 py-0.5 rounded">
                        {r.ia_categoria}
                      </span>
                    </div>

                    <p className="text-sm text-civic-text mb-2 line-clamp-2">{r.descripcion}</p>

                    {/* Datos exclusivos institucional */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="bg-civic-bg rounded-lg p-2">
                        <p className="text-civic-muted mb-0.5">Reportero</p>
                        <p className="text-civic-accent font-medium">@{r.pseudonimo}</p>
                      </div>
                      <div className="bg-civic-bg rounded-lg p-2">
                        <p className="text-civic-muted mb-0.5">Ubicación aprox.</p>
                        <p className="text-civic-text font-mono">{r.lat.toFixed(2)}, {r.lng.toFixed(2)}</p>
                      </div>
                      <div className="bg-civic-bg rounded-lg p-2">
                        <p className="text-civic-muted mb-0.5">IA confianza</p>
                        <p className="text-civic-green font-medium flex items-center gap-1">
                          <Brain size={10} />{r.ia_confianza}%
                        </p>
                      </div>
                      <div className="bg-civic-bg rounded-lg p-2">
                        <p className="text-civic-muted mb-0.5">Registrado</p>
                        <p className="text-civic-text">{fecha}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer con hash y acciones */}
                <div className="px-4 py-3 bg-civic-bg border-t border-civic-border flex items-center justify-between flex-wrap gap-2">
                  <code className="text-xs font-mono text-civic-accent/70">{r.hash}</code>
                  <div className="flex gap-2">
                    <Link
                      to={`/verificar/${r.id}`}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-civic-border text-civic-muted rounded-lg hover:text-civic-text hover:border-civic-accent/30 transition-all"
                    >
                      <Shield size={11} />
                      Verificar
                    </Link>
                    <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-civic-green/10 border border-civic-green/30 text-civic-green rounded-lg hover:bg-civic-green/20 transition-all">
                      <Download size={11} />
                      Exportar certificado
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
