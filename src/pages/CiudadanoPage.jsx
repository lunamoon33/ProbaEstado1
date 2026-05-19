import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Star, Shield, TrendingUp, TrendingDown, Award, Info } from "lucide-react";
import { CIUDADANO_MOCK, REPORTES_MOCK, getStatusInfo } from "../data/mock.js";

export function CiudadanoPage() {
  const ciudadano = CIUDADANO_MOCK;
  const misReportes = REPORTES_MOCK.filter(r => r.pseudonimo === ciudadano.pseudonimo);
  const [tab, setTab] = useState("reportes");

  const nivelColor = ciudadano.puntos > 300
    ? "text-civic-green border-civic-green/30 bg-civic-green/10"
    : ciudadano.puntos > 100
    ? "text-civic-accent border-civic-accent/30 bg-civic-accent/10"
    : "text-civic-muted border-civic-border bg-civic-surface";

  return (
    <div className="pt-14 min-h-screen bg-civic-bg">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Profile card */}
        <div className="bg-civic-card border border-civic-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-civic-accent/10 border-2 border-civic-accent/30 flex items-center justify-center">
              <User size={24} className="text-civic-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-civic-text">@{ciudadano.pseudonimo}</h2>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${nivelColor}`}>
                <Award size={10} className="inline mr-1" />
                {ciudadano.nivel}
              </span>
            </div>
            <div className="ml-auto text-right">
              <p className="text-3xl font-bold font-mono text-civic-accent">{ciudadano.puntos}</p>
              <p className="text-xs text-civic-muted">puntos de reputación</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Enviados", val: ciudadano.reportes_enviados, color: "text-civic-text" },
              { label: "Validados", val: ciudadano.reportes_validados, color: "text-civic-green" },
              { label: "Rechazados", val: ciudadano.reportes_rechazados, color: "text-[#FF3B5C]" },
              { label: "Créditos SYS", val: ciudadano.creditos_ganados.toFixed(1), color: "text-[#FFB800]" },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-civic-bg rounded-lg p-3 text-center">
                <p className={`text-xl font-bold font-mono ${color}`}>{val}</p>
                <p className="text-xs text-civic-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cómo funciona el incentivo */}
        <div className="flex items-start gap-3 p-4 bg-civic-surface border border-civic-border rounded-xl mb-6">
          <Info size={16} className="text-civic-accent mt-0.5 flex-shrink-0" />
          <div className="text-xs text-civic-muted leading-relaxed space-y-1">
            <p><span className="text-civic-green font-medium">Reporte validado</span> → ganas puntos + % de créditos SYS cuando alguien paga por tus datos</p>
            <p><span className="text-[#FF3B5C] font-medium">Reporte falso o rechazado</span> → pierdes puntos → tu reporte vale menos → ganas menos</p>
            <p><span className="text-[#FFB800] font-medium">Más puntos</span> → tus reportes tienen más peso → más probabilidad de ser comprados por instituciones</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-civic-surface border border-civic-border rounded-xl p-1">
          {[
            { id: "reportes", label: "Mis reportes" },
            { id: "creditos", label: "Mis créditos" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 text-sm rounded-lg transition-all ${
                tab === t.id
                  ? "bg-civic-card text-civic-text font-medium"
                  : "text-civic-muted hover:text-civic-text"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "reportes" && (
          <div className="space-y-3">
            {misReportes.length === 0 ? (
              <p className="text-civic-muted text-sm text-center py-8">
                Aún no has enviado reportes. Usa el bot de Discord para empezar.
              </p>
            ) : misReportes.map(r => {
              const status = getStatusInfo(r);
              const fecha = new Date(r.created_at).toLocaleDateString("es-PE", {
                day: "numeric", month: "short"
              });
              return (
                <Link
                  key={r.id}
                  to={`/reporte/${r.id}`}
                  className="flex gap-4 bg-civic-card border border-civic-border rounded-xl p-4 hover:border-civic-accent/30 transition-all"
                >
                  {/* Tu foto — visible porque es tuya */}
                  <img
                    src={r.imagen_url}
                    alt="evidencia"
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.badgeClass}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-civic-muted">{fecha}</span>
                    </div>
                    <p className="text-sm text-civic-text line-clamp-2 mb-2">{r.descripcion}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-civic-green">
                        <TrendingUp size={11} />
                        +{Math.floor(r.ia_confianza / 10)} pts
                      </span>
                      <code className="text-civic-accent/60 font-mono">{r.hash.slice(0, 12)}...</code>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {tab === "creditos" && (
          <div className="space-y-3">
            <div className="bg-civic-card border border-civic-border rounded-xl p-5 text-center">
              <p className="text-4xl font-bold font-mono text-[#FFB800] mb-1">
                {ciudadano.creditos_ganados.toFixed(2)}
              </p>
              <p className="text-sm text-civic-muted mb-4">créditos SYS acumulados</p>
              <div className="text-xs text-civic-muted bg-civic-bg rounded-lg p-3">
                Los créditos se acumulan cada vez que una institución paga por acceder a tus reportes verificados.
                Próximamente podrás canjearlos por SYS en tu wallet.
              </div>
            </div>

            {/* Historial simulado */}
            <div className="bg-civic-card border border-civic-border rounded-xl p-4">
              <h4 className="text-sm font-semibold text-civic-text mb-3">Historial</h4>
              {[
                { desc: "Municipalidad San Isidro accedió a tu reporte", monto: "+2.5 SYS", color: "text-civic-green", icon: TrendingUp },
                { desc: "Periodista El Comercio descargó certificado", monto: "+5.0 SYS", color: "text-civic-green", icon: TrendingUp },
                { desc: "Reporte rechazado por IA — imagen no válida", monto: "-15 pts", color: "text-[#FF3B5C]", icon: TrendingDown },
                { desc: "ONG accedió a datos de tu reporte", monto: "+5.0 SYS", color: "text-civic-green", icon: TrendingUp },
              ].map(({ desc, monto, color, icon: Icon }, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-civic-border last:border-0">
                  <div className="flex items-center gap-2">
                    <Icon size={13} className={color} />
                    <span className="text-xs text-civic-muted">{desc}</span>
                  </div>
                  <span className={`text-xs font-mono font-medium ${color}`}>{monto}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
