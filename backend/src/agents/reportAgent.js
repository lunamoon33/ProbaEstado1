export default class ReportAgent {
  analyzeReport(data = {}) {
    const { title = '', description = '', category = null, userId = null } = data;
    console.log('[REPORT_AGENT] Analizando datos entrantes para el registro:', { title, description, category, userId });

    const text = `${title} ${description}`.toLowerCase();
    const finalCategory = category || this.classifyReport(text);
    const priority = this.detectPriority(text);

    return {
      category: finalCategory.toUpperCase(), // Forzamos mayúsculas para cumplir con el estándar (e.g., INFRASTRUCTURE)
      priority,
      title,
      description,
      userId
    };
  }

  classifyReport(text) {
    if (!text) return 'OTHER';

    // Priorizamos seguridad y corrupción primero
    if (text.includes('seguridad') || text.includes('robo') || text.includes('amenaza') || text.includes('corrupción')) {
      return 'SECURITY';
    }

    if (text.includes('basura') || text.includes('inundación') || text.includes('contaminación') || text.includes('ambiente')) {
      return 'ENVIRONMENTAL';
    }

    if (text.includes('bache') || text.includes('luz') || text.includes('agua') || text.includes('infraestructura') || text.includes('estadio')) {
      return 'INFRASTRUCTURE';
    }

    return 'OTHER';
  }

  detectPriority(text) {
    const normalized = String(text || '').toLowerCase();

    // Elevamos corrupción y riesgos estructurales graves a prioridad CRITICAL
    if (normalized.match(/\b(violencia|amenaza|riesgo|corrupción|soborno|fraude)\b/)) {
      return 'CRITICAL';
    }

    if (normalized.match(/\b(robo|asalto|incendio|inundación|desbordamiento)\b/)) {
      return 'HIGH';
    }

    if (normalized.match(/\b(bache|luz|basura|infraestructura)\b/)) {
      return 'MEDIUM';
    }

    return 'LOW';
  }
}
