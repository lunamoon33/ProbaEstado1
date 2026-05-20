import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api.js";
import { ArrowLeft, Brain, Shield, ExternalLink, Copy, Check, Loader2 } from "lucide-react";

export function ReportePage() {
  const { id } = useParams();
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getReporte(id)
      .then((res) => {
        const data = res.data || res;
        setReporte(data);
        setLoading(false);
      })
      .catch(() => { setError("Reporte no encontrado"); setLoading(false); });
  }, [id]);

  const hash = reporte?.blockchainHash || reporte?.hash || "Sin registrar";
  const txUrl = hash.startsWith("https://") ? hash : `https://explorer-zk.tanenbaum.io/tx/${hash}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${txUrl}`;

  const copyHash = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="pt-14 flex items-center justify-center min-h-screen">
      <Loader2 size={32} className="text-civic-accent animate-spin" />
    </div>
  );

  if (error) return (
    <div className="pt-14 flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-civic-muted">{error}</p>
      <Link to="/" className="text-civic-accent hover:underline text-sm">← Volver al mapa</Link>
    </div>
  );

  const fecha = new Date(reporte.createdAt || reporte.created_at).toLocaleString("es-PE", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const prioridad = reporte.priority || "low";
  const prioColor = prioridad === "high" ? "badge-urgente" : prioridad === "medium" ? "badge-revision" : "badge-validado";

  return (
    <div className="pt-14 min-h-screen bg-civic-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="flex items-center gap-2 text-civic-muted hover:text-civic-text text-sm mb-6 transition-colors">
          <ArrowLeft size={14} />Volver al mapa
        </Link>

        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${prioColor}`}>
                {prioridad === "high" ? "Urgente" : prioridad === "medium" ? "En revisión" : "Registrado"}
              </span>
              <span className="text-xs text-civic-muted bg-civic-surface border border-civic-border px-2 py-1 rounded">
                {reporte.category || reporte.ia_categoria || "other"}
              </span>
            </div>
            <h1 className="text-xl font-bold text-civic-text leading-snug max-w-xl">
              {reporte.title || reporte.descripcion}
            </h1>
            <p className="text-sm text-civic-muted mt-1">{reporte.description || ""}</p>
            <p className="text-xs text-civic-muted mt-1">Registrado: {fecha}</p>
          </div>
        </div>

        {/* Resumen IA */}
        <div className="bg-civic-card border border-civic-border rounded-xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={16} className="text-civic-accent" />
            <h3 className="text-sm font-semibold text-civic-text">Análisis IA</h3>
          </div>
          <p className="text-sm text-civic-muted">{reporte.summary || "Sin análisis disponible"}</p>
        </div>

        {/* Hash blockchain */}
        <div className="bg-civic-card border border-civic-border rounded-xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-civic-green" />
            <h3 className="text-sm font-semibold text-civic-text">Credencial verificable en blockchain</h3>
            <span className="text-xs bg-civic-green/10 text-civic-green border border-civic-green/30 px-2 py-0.5 rounded-full">zkSYS</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <code className="flex-1 text-xs font-mono text-civic-accent bg-civic-bg px-4 py-3 rounded-lg border border-civic-border break-all">
              {hash}
            </code>
            <button onClick={copyHash} className="p-2.5 bg-civic-bg border border-civic-border rounded-lg hover:border-civic-accent/40 transition-all">
              {copied ? <Check size={14} className="text-civic-green" /> : <Copy size={14} className="text-civic-muted" />}
            </button>
          </div>

          {hash !== "Sin registrar" && (
            <a href={txUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-civic-accent hover:underline">
              <ExternalLink size={12} />Ver en zkSYS Explorer
            </a>
          )}
        </div>

        {/* QR */}
        {hash !== "Sin registrar" && (
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-xl inline-block">
              <img src={qrUrl} alt="QR verificable" className="w-32 h-32" />
              <p className="text-xs text-gray-400 text-center mt-2">Escanea para verificar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}