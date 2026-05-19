import { Link, useLocation } from "react-router-dom";
import { MapPin, LayoutDashboard, Rss, User, Building2, ShieldCheck, LogIn } from "lucide-react";

export function Navbar() {
  const loc = useLocation();
  const active = (path) =>
    loc.pathname === path
      ? "text-civic-accent border-b border-civic-accent pb-0.5"
      : "text-civic-muted hover:text-civic-text transition-colors";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-civic-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-civic-accent/20 border border-civic-accent/40 flex items-center justify-center">
            <ShieldCheck size={14} className="text-civic-accent" />
          </div>
          <span className="font-display font-bold text-sm tracking-widest uppercase text-civic-text">
            Proba<span className="text-civic-accent">Estado</span>
          </span>
        </Link>

        <div className="flex items-center gap-5 text-sm font-medium">
          <Link to="/" className={active("/")}>
            <span className="flex items-center gap-1.5"><MapPin size={13} />Mapa</span>
          </Link>
          <Link to="/monitoreo" className={active("/monitoreo")}>
            <span className="flex items-center gap-1.5"><Rss size={13} />Monitoreo</span>
          </Link>
          <Link to="/municipio" className={active("/municipio")}>
            <span className="flex items-center gap-1.5"><LayoutDashboard size={13} />Dashboard</span>
          </Link>
          <Link to="/ciudadano" className={active("/ciudadano")}>
            <span className="flex items-center gap-1.5"><User size={13} />Mi perfil</span>
          </Link>
          <Link
            to="/institucional"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-all ${
              loc.pathname === "/institucional"
                ? "bg-civic-green/20 border-civic-green text-civic-green"
                : "border-civic-green/30 text-civic-green hover:bg-civic-green/10"
            }`}
          >
            <Building2 size={12} />Institucional
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-civic-green animate-pulse" />
            <span className="text-xs text-civic-muted font-mono hidden md:block">zkSYS testnet</span>
          </div>
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-civic-accent/10 border border-civic-accent/40 text-civic-accent rounded-lg text-xs font-semibold hover:bg-civic-accent/20 transition-all"
          >
            <LogIn size={12} />
            Conectar
          </Link>
        </div>
      </div>
    </nav>
  );
}
