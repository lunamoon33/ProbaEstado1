import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Wallet, Mail, ArrowRight, AlertTriangle, Building2, User, ChevronRight } from "lucide-react";

const TIERS = [
  {
    id: "ciudadano",
    icon: User,
    label: "Ciudadano",
    desc: "Reporta incidentes, gana créditos SYS por tus reportes verificados",
    color: "border-civic-accent/40 hover:border-civic-accent",
    iconColor: "text-civic-accent",
    bg: "bg-civic-accent/5",
    free: true,
  },
  {
    id: "institucional",
    icon: Building2,
    label: "Institucional",
    desc: "Acceso completo — fotos, seudónimos, exportar certificados. Municipios, periodistas, abogados, ONGs",
    color: "border-civic-green/40 hover:border-civic-green",
    iconColor: "text-civic-green",
    bg: "bg-civic-green/5",
    free: false,
  },
];

export function LoginPage() {
  const [tier, setTier] = useState(null);
  const [step, setStep] = useState("tier"); // tier | method | connecting
  const [method, setMethod] = useState(null);
  const navigate = useNavigate();

  const handleMethod = (m) => {
    setMethod(m);
    setStep("connecting");
    setTimeout(() => {
      navigate(tier === "institucional" ? "/institucional" : "/ciudadano");
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-civic-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-civic-accent/10 border border-civic-accent/30 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={28} className="text-civic-accent" />
          </div>
          <h1 className="text-2xl font-bold text-civic-text">
            Proba<span className="text-civic-accent">Estado</span>
          </h1>
          <p className="text-civic-muted text-sm mt-1">Reportes ciudadanos verificados en blockchain</p>
        </div>

        {/* Step 1 — elegir tier */}
        {step === "tier" && (
          <div>
            <p className="text-sm text-civic-muted text-center mb-5">¿Cómo vas a usar ProbaEstado?</p>
            <div className="space-y-3 mb-6">
              {TIERS.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setTier(t.id); setStep("method"); }}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border ${t.bg} ${t.color} transition-all text-left`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-civic-card flex items-center justify-center flex-shrink-0 ${t.iconColor}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-civic-text">{t.label}</span>
                        {t.free
                          ? <span className="text-xs bg-civic-accent/10 text-civic-accent px-2 py-0.5 rounded-full border border-civic-accent/20">Gratis</span>
                          : <span className="text-xs bg-civic-green/10 text-civic-green px-2 py-0.5 rounded-full border border-civic-green/20">De pago</span>
                        }
                      </div>
                      <p className="text-xs text-civic-muted leading-relaxed">{t.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-civic-muted mt-1 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-civic-muted text-center">
              ¿Solo explorar?{" "}
              <Link to="/" className="text-civic-accent hover:underline">Ver mapa público →</Link>
            </p>
          </div>
        )}

        {/* Step 2 — elegir método */}
        {step === "method" && (
          <div>
            <button
              onClick={() => setStep("tier")}
              className="text-xs text-civic-muted hover:text-civic-text mb-5 flex items-center gap-1"
            >
              ← Volver
            </button>

            <p className="text-sm text-civic-muted text-center mb-5">
              Conecta como <span className="text-civic-text font-medium">{tier === "institucional" ? "Institución" : "Ciudadano"}</span>
            </p>

            <div className="space-y-3 mb-6">
              {/* Wallet */}
              <button
                onClick={() => handleMethod("wallet")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-civic-accent/30 bg-civic-accent/5 hover:border-civic-accent hover:bg-civic-accent/10 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-civic-card border border-civic-border flex items-center justify-center">
                  <Wallet size={18} className="text-civic-accent" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-civic-text">Conectar wallet</p>
                  <p className="text-xs text-civic-muted">MetaMask, WalletConnect — red zkSYS</p>
                </div>
                <ArrowRight size={14} className="text-civic-muted" />
              </button>

              {/* Email */}
              <button
                onClick={() => handleMethod("email")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-civic-border hover:border-civic-accent/30 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-civic-card border border-civic-border flex items-center justify-center">
                  <Mail size={18} className="text-civic-muted" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-civic-text">Continuar con email</p>
                  <p className="text-xs text-civic-muted">Sin crypto — Privy crea tu wallet automáticamente</p>
                </div>
                <ArrowRight size={14} className="text-civic-muted" />
              </button>
            </div>

            {/* Aviso gas */}
            <div className="flex items-start gap-2 p-3 bg-civic-surface border border-civic-border rounded-lg">
              <AlertTriangle size={13} className="text-[#FFB800] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-civic-muted leading-relaxed">
                Cada reporte genera una credencial verificable en zkSYS. 
                <span className="text-[#FFB800]"> El gas lo absorbe ProbaEstado</span> — tú no pagas nada para reportar.
              </p>
            </div>
          </div>
        )}

        {/* Step 3 — conectando */}
        {step === "connecting" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full border-2 border-civic-accent/30 border-t-civic-accent animate-spin mx-auto mb-6" />
            <p className="text-civic-text font-medium mb-1">
              {method === "wallet" ? "Conectando wallet..." : "Enviando magic link..."}
            </p>
            <p className="text-xs text-civic-muted">
              {method === "wallet"
                ? "Acepta la conexión en tu wallet — red zkSYS Testnet (Chain ID 57057)"
                : "Revisa tu correo para confirmar el acceso"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
