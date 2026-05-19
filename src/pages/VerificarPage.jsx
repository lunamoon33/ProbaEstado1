import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api.js";
import { Shield, CheckCircle2, XCircle, Loader2, ArrowLeft, ExternalLink } from "lucide-react";

export function VerificarPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.verificarReporte(id)
      .then(({ data }) => { setData(data); setLoading(false); })
      .catch(() => { setError("No se pudo verificar este reporte"); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-civic-bg">
      <Loader2 size={32} className="text-civic-accent animate-spin" />
      <p className="text-civic-muted text-sm">Verificando en zkSYS blockchain...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-civic-bg">
      <XCircle size={40} className="text-[#FF3B5C]" />
      <p className="text-civic-text font-semibold">Verificación fallida</p>
      <p className="text-civic-muted text-sm">{error}</p>
    </div>
  );

  const fecha = new Date(data.created_at).toLocaleString("es-PE", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <div className="min-h-screen bg-civic-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header verificación */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-civic-green/10 border-2 border-civic-green/40 flex items-center justify-center mx-auto mb-4 glow-green">
            <CheckCircle2 size={28} className="text-civic-green" />
          </div>
          <h1 className="text-2xl font-bold text-civic-text mb-1">Reporte verificado</h1>
          <p className="text-civic-muted text-sm">Este incidente está registrado en la blockchain y no puede modificarse</p>
        </div>

        {/* Card principal */}
        <div className="bg-civic-card border border-civic-border rounded-2xl overflow-hidden mb-4">
          <img src={data.imagen_url} alt="evidencia" className="w-full h-52 object-cover" />

          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-civic-muted mb-1">Descripción del incidente</p>
              <p className="text-civic-text font-medium leading-snug">{data.descripcion}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-civic-bg rounded-lg p-3">
                <p className="text-civic-muted mb-0.5">Categoría</p>
                <p className="text-civic-text font-medium">{data.ia_categoria}</p>
              </div>
              <div className="bg-civic-bg rounded-lg p-3">
                <p className="text-civic-muted mb-0.5">Confianza IA</p>
                <p className="text-civic-green font-medium">{data.ia_confianza}%</p>
              </div>
              <div className="bg-civic-bg rounded-lg p-3">
                <p className="text-civic-muted mb-0.5">Red blockchain</p>
                <p className="text-civic-accent font-medium">{data.blockchain}</p>
              </div>
              <div className="bg-civic-bg rounded-lg p-3">
                <p className="text-civic-muted mb-0.5">Chain ID</p>
                <p className="text-civic-text font-mono">{data.chain_id}</p>
              </div>
            </div>

            <div className="bg-civic-bg rounded-lg p-3">
              <p className="text-xs text-civic-muted mb-1">Hash de verificación</p>
              <code className="text-xs font-mono text-civic-accent break-all">{data.hash}</code>
            </div>

            <div className="flex items-center justify-between text-xs text-civic-muted">
              <span>Registrado: {fecha}</span>
              <span className="flex items-center gap-1 text-civic-green">
                <Shield size={11} />
                Inmutable
              </span>
            </div>
          </div>
        </div>

        {/* QR */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-3 rounded-xl">
            <img src={data.qr_url} alt="QR" className="w-24 h-24" />
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            to={`/reporte/${data.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-civic-surface border border-civic-border text-civic-muted rounded-lg text-sm hover:text-civic-text transition-colors"
          >
            <ArrowLeft size={14} />
            Ver detalle
          </Link>
          <a
            href={`https://explorer-zk.tanenbaum.io`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-civic-accent/10 border border-civic-accent/40 text-civic-accent rounded-lg text-sm hover:bg-civic-accent/20 transition-all"
          >
            <ExternalLink size={14} />
            Ver en zkSYS Explorer
          </a>
        </div>
      </div>
    </div>
  );
}
