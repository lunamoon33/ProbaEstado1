import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api.js";
import { getStatusInfo } from "../data/mock.js";
import { ArrowLeft, Brain, MapPin, Shield, ExternalLink, Copy, Check, Loader2 } from "lucide-react";

export function ReportePage() {
  const { id } = useParams();
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getReporte(id)
      .then(({ data }) => { setReporte(data); setLoading(false); })
      .catch(() => { setError("Reporte no encontrado"); setLoading(false); });
  }, [id]);

  const copyHash = () => {
    navigator.clipboard.writeText(reporte.hash);
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

  const status = getStatusInfo(reporte);
  const fecha = new Date(reporte.created_at).toLocaleString("es-PE", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <div className="pt-14 min-h-screen bg-civic-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="flex items-center gap-2 text-civic-muted hover:text-civic-text text-sm mb-6 transition-colors">
          <ArrowLeft size={14} />
          Volver al mapa
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.badgeClass}`}>
                {status.label}
              </span>
              <span className="text-xs text-civic-muted bg-civic-surface border border-civic-border px-2 py-1 rounded">
                {reporte.ia_categoria}
              </span>
            </div>
            <h1 className="text-xl font-bold text-civic-text leading-snug max-w-xl">
              {reporte.descripcion}
            </h1>
            <p className="text-xs text-civic-muted mt-1">
              Reportado por <span className="text-civic-accent">@{reporte.pseudonimo}</span> · {fecha}
            </p>
          </div>

          <Link
            to={`/verificar/${reporte.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-civic-accent/10 border border-civic-accent/40 text-civic-accent rounded-lg text-sm hover:bg-civic-accent/20 transition-all"
          >
            <Shield size={14} />
            Verificar autenticidad
          </Link>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Imagen */}
          <div className="rounded-xl overflow-hidden border border-civic-border">
            <img src={reporte.imagen_url} alt="evidencia" className="w-full h-64 object-cover" />
          </div>

          {/* IA Score */}
          <div className="space-y-4">
            <div className="bg-civic-card border border-civic-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={16} className="text-civic-accent" />
                <h3 className="text-sm font-semibold text-civic-text">Análisis Gemini Vision</h3>
              </div>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold font-mono text-civic-green">
                  {reporte.ia_confianza}%
                </span>
                <span className="text-xs text-civic-muted pb-1.5">confianza</span>
              </div>
              <div className="w-full bg-civic-border rounded-full h-1.5 mb-4">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-civic-accent to-civic-green transition-all"
                  style={{ width: `${reporte.ia_confianza}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-civic-bg rounded-lg p-2.5">
                  <p className="text-civic-muted mb-0.5">Categoría</p>
                  <p className="text-civic-text font-medium">{reporte.ia_categoria}</p>
                </div>
                <div className="bg-civic-bg rounded-lg p-2.5">
                  <p className="text-civic-muted mb-0.5">Validez IA</p>
                  <p className={reporte.ia_valido ? "text-civic-green font-medium" : "text-[#FF3B5C] font-medium"}>
                    {reporte.ia_valido ? "✓ Válido" : "✗ Rechazado"}
                  </p>
                </div>
              </div>
            </div>

            {/* Geolocalización */}
            <div className="bg-civic-card border border-civic-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-civic-accent" />
                <h3 className="text-sm font-semibold text-civic-text">Ubicación</h3>
              </div>
              <p className="text-civic-muted text-xs font-mono">
                {reporte.lat}, {reporte.lng}
              </p>
            </div>
          </div>
        </div>

        {/* Hash blockchain */}
        <div className="mt-5 bg-civic-card border border-civic-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-civic-green" />
            <h3 className="text-sm font-semibold text-civic-text">Credencial verificable en blockchain</h3>
            <span className="text-xs bg-civic-green/10 text-civic-green border border-civic-green/30 px-2 py-0.5 rounded-full">
              zkSYS
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <code className="flex-1 text-xs font-mono text-civic-accent bg-civic-bg px-4 py-3 rounded-lg border border-civic-border break-all">
              {reporte.hash}
            </code>
            <button
              onClick={copyHash}
              className="p-2.5 bg-civic-bg border border-civic-border rounded-lg hover:border-civic-accent/40 transition-all"
            >
              {copied ? <Check size={14} className="text-civic-green" /> : <Copy size={14} className="text-civic-muted" />}
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={reporte.link_verificable}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-civic-accent hover:underline"
            >
              <ExternalLink size={12} />
              Ver en explorer
            </a>
            <Link
              to={`/verificar/${reporte.id}`}
              className="flex items-center gap-1.5 text-xs text-civic-muted hover:text-civic-text"
            >
              <Shield size={12} />
              Verificación pública
            </Link>
          </div>
        </div>

        {/* QR */}
        <div className="mt-5 flex justify-center">
          <div className="bg-white p-4 rounded-xl inline-block">
            <img src={reporte.qr_url} alt="QR verificable" className="w-32 h-32" />
            <p className="text-xs text-gray-400 text-center mt-2">Escanea para verificar</p>
          </div>
        </div>
      </div>
    </div>
  );
}
