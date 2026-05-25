import { Link } from "react-router-dom";
import { MapPin, Brain, ExternalLink } from "lucide-react";
import { getStatusInfo } from "../data/mock.js";

export function ReporteCard({ reporte }) {
  const status = getStatusInfo(reporte);
  const fecha = new Date(reporte.created_at).toLocaleDateString("es-PE", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <Link
      to={`/reporte/${reporte.id}`}
      className="block bg-civic-card border border-civic-border rounded-xl overflow-hidden hover:border-civic-accent/40 transition-all hover:glow-accent group"
    >
      <div className="relative h-40 overflow-hidden">
<img
  src={reporte.imagen_url || `https://picsum.photos/seed/${reporte.id}/600/400`}
  alt="evidencia"
  onError={(e) => { e.target.src = `https://picsum.photos/seed/${reporte.id}/600/400`; }}
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
/>
        <div className="absolute inset-0 bg-gradient-to-t from-civic-card to-transparent" />
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${status.badgeClass}`}
        >
          {status.label}
        </span>
        <span className="absolute top-3 right-3 text-xs bg-black/60 text-civic-muted px-2 py-1 rounded font-mono">
          {reporte.ia_categoria}
        </span>
      </div>

      <div className="p-4">
        <p className="text-sm text-civic-text leading-snug line-clamp-2 mb-3">
          {reporte.descripcion}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-civic-muted">
            <span className="flex items-center gap-1">
              <Brain size={11} />
              {reporte.ia_confianza}%
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {reporte.lat.toFixed(3)}, {reporte.lng.toFixed(3)}
            </span>
          </div>
          <span className="text-xs text-civic-muted">{fecha}</span>
        </div>

        <div className="mt-3 pt-3 border-t border-civic-border flex items-center justify-between">
          <code className="text-xs text-civic-accent/70 font-mono">
            {reporte.hash.slice(0, 14)}...
          </code>
          <ExternalLink size={12} className="text-civic-muted group-hover:text-civic-accent transition-colors" />
        </div>
      </div>
    </Link>
  );
}
