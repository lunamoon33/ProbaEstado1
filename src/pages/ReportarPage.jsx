import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Send, Loader2, CheckCircle2 } from "lucide-react";

const CATEGORIAS = ["infrastructure", "security", "environmental", "other"];

export function ReportarPage() {
  const [form, setForm] = useState({ title: "", description: "", category: "other" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!form.title || !form.description) {
      setError("Título y descripción son obligatorios");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.status === "success") {
        setSuccess(data.data);
      } else {
        setError("Error al enviar el reporte");
      }
    } catch (e) {
      setError("No se pudo conectar con el servidor");
    }
    setLoading(false);
  };

  if (success) return (
    <div className="pt-14 min-h-screen bg-civic-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-civic-green/10 border-2 border-civic-green/40 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-civic-green" />
        </div>
        <h2 className="text-xl font-bold text-civic-text mb-2">¡Reporte registrado!</h2>
        <p className="text-civic-muted text-sm mb-4">Tu reporte fue procesado y certificado en zkSYS</p>

        <div className="bg-civic-card border border-civic-border rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-civic-muted mb-1">Hash blockchain</p>
          <code className="text-xs font-mono text-civic-accent break-all">
            {success.blockchainHash || "Procesando..."}
          </code>
          {success.blockchainHash && success.blockchainHash.startsWith("https://") && (
            <a href={success.blockchainHash} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-civic-accent hover:underline mt-2">
              Ver en zkSYS Explorer →
            </a>
          )}
        </div>

        <button onClick={() => navigate("/")}
          className="w-full py-2.5 bg-civic-accent/10 border border-civic-accent/40 text-civic-accent rounded-lg text-sm hover:bg-civic-accent/20 transition-all">
          Ver en el mapa
        </button>
      </div>
    </div>
  );

  return (
    <div className="pt-14 min-h-screen bg-civic-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Shield size={20} className="text-civic-accent" />
          <h1 className="text-xl font-bold text-civic-text">Nuevo reporte ciudadano</h1>
        </div>

        <div className="bg-civic-card border border-civic-border rounded-xl p-6 space-y-4">
          <div>
            <label className="text-xs text-civic-muted mb-1.5 block">Título del incidente</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Ej: Hueco en Av. Brasil"
              className="w-full bg-civic-bg border border-civic-border rounded-lg px-4 py-2.5 text-sm text-civic-text placeholder-civic-muted focus:outline-none focus:border-civic-accent transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-civic-muted mb-1.5 block">Descripción</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe el problema con detalle..."
              rows={4}
              className="w-full bg-civic-bg border border-civic-border rounded-lg px-4 py-2.5 text-sm text-civic-text placeholder-civic-muted focus:outline-none focus:border-civic-accent transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-civic-muted mb-1.5 block">Categoría</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full bg-civic-bg border border-civic-border rounded-lg px-4 py-2.5 text-sm text-civic-text focus:outline-none focus:border-civic-accent transition-colors"
            >
              {CATEGORIAS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-[#FF3B5C]">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-civic-accent/10 border border-civic-accent/40 text-civic-accent rounded-lg text-sm font-semibold hover:bg-civic-accent/20 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {loading ? "Registrando en zkSYS..." : "Enviar reporte"}
          </button>

          <p className="text-xs text-civic-muted text-center">
            Tu reporte será certificado en blockchain de forma anónima
          </p>
        </div>
      </div>
    </div>
  );
}