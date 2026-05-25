import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Send, Loader2, CheckCircle2, ImagePlus, X, MapPin } from "lucide-react";
import { api } from "../services/api.js";

const CATEGORIAS = [
  { value: "infrastructure", label: "Infraestructura vial" },
  { value: "lighting", label: "Alumbrado" },
  { value: "waste", label: "Residuos" },
  { value: "signage", label: "Señalización" },
  { value: "security", label: "Seguridad" },
  { value: "other", label: "Otro" },
];

export function ReportarPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
    location: "",
  });
  const [imagen, setImagen] = useState(null);       // File object
  const [preview, setPreview] = useState(null);     // URL para preview
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImagen = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Solo se aceptan imágenes (JPG, PNG, WEBP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("La imagen no puede superar 10MB");
      return;
    }
    setError(null);
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImagen(file);
  };

  const quitarImagen = () => {
    setImagen(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description) {
      setError("Título y descripción son obligatorios");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Construir FormData para enviar imagen + datos
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("location", form.location);
      if (imagen) formData.append("imagen", imagen);

      const data = await api.crearReporte(formData);

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

  // --- Pantalla de éxito ---
  if (success) return (
    <div className="pt-14 min-h-screen bg-civic-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-civic-green/10 border-2 border-civic-green/40 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-civic-green" />
        </div>
        <h2 className="text-xl font-bold text-civic-text mb-2">¡Reporte registrado!</h2>
        <p className="text-civic-muted text-sm mb-4">Tu reporte fue procesado y certificado en zkSYS</p>

        {/* Preview imagen si se subió */}
        {preview && (
          <div className="mb-4 rounded-xl overflow-hidden border border-civic-border">
            <img src={preview} alt="evidencia" className="w-full h-40 object-cover" />
          </div>
        )}

        <div className="bg-civic-card border border-civic-border rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-civic-muted mb-1">Hash blockchain</p>
          <code className="text-xs font-mono text-civic-accent break-all">
            {success.blockchainHash || success.hash || "Procesando..."}
          </code>
          {success.ia_confianza && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-civic-muted">Confianza IA:</span>
              <span className="text-xs font-semibold text-civic-green">{success.ia_confianza}%</span>
              <span className="text-xs text-civic-muted">· {success.ia_categoria}</span>
            </div>
          )}
        </div>

        {/* QR si hay hash */}
        {(success.blockchainHash || success.hash) && (
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-xl inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${success.link_verificable || "https://verify.civicapp.io"}`}
                alt="QR verificable"
                className="w-28 h-28"
              />
              <p className="text-xs text-gray-400 text-center mt-1">Escanea para verificar</p>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/")}
          className="w-full py-2.5 bg-civic-accent/10 border border-civic-accent/40 text-civic-accent rounded-lg text-sm hover:bg-civic-accent/20 transition-all"
        >
          Ver en el mapa
        </button>
      </div>
    </div>
  );

  // --- Formulario ---
  return (
    <div className="pt-14 min-h-screen bg-civic-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Shield size={20} className="text-civic-accent" />
          <h1 className="text-xl font-bold text-civic-text">Nuevo reporte ciudadano</h1>
        </div>

        <div className="bg-civic-card border border-civic-border rounded-xl p-6 space-y-4">

          {/* Upload de imagen */}
          <div>
            <label className="text-xs text-civic-muted mb-1.5 block">
              Evidencia fotográfica <span className="text-civic-muted/60">(opcional pero recomendada)</span>
            </label>

            {!preview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={`
                  w-full h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
                  ${dragOver
                    ? "border-civic-accent bg-civic-accent/5"
                    : "border-civic-border hover:border-civic-accent/50 hover:bg-civic-accent/5"
                  }
                `}
              >
                <ImagePlus size={24} className="text-civic-muted" />
                <p className="text-xs text-civic-muted">
                  Arrastra una imagen o <span className="text-civic-accent">haz clic para subir</span>
                </p>
                <p className="text-xs text-civic-muted/60">JPG, PNG, WEBP · máx 10MB</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-civic-border">
                <img src={preview} alt="preview" className="w-full h-48 object-cover" />
                <button
                  onClick={quitarImagen}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all"
                >
                  <X size={14} className="text-white" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                  <p className="text-xs text-white/80 truncate">{imagen?.name}</p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImagen(e.target.files[0])}
            />
          </div>

          {/* Título */}
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

          {/* Descripción */}
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

          {/* Categoría */}
          <div>
            <label className="text-xs text-civic-muted mb-1.5 block">Categoría</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full bg-civic-bg border border-civic-border rounded-lg px-4 py-2.5 text-sm text-civic-text focus:outline-none focus:border-civic-accent transition-colors"
            >
              {CATEGORIAS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Ubicación (texto libre por ahora) */}
          <div>
            <label className="text-xs text-civic-muted mb-1.5 block">
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                Ubicación aproximada <span className="text-civic-muted/60">(opcional)</span>
              </span>
            </label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              placeholder="Ej: Av. Brasil cdra. 8, Pueblo Libre"
              className="w-full bg-civic-bg border border-civic-border rounded-lg px-4 py-2.5 text-sm text-civic-text placeholder-civic-muted focus:outline-none focus:border-civic-accent transition-colors"
            />
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
