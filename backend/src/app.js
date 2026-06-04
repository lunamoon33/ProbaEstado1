import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
// Rutas corregidas quitando el prefijo duplicado src/
import authRoutes from './routes/auth.routes.js';
import reportRoutes from './routes/report.routes.js';
import auditRoutes from './routes/auditRoutes.js';
import agentRoutes from './routes/agent.routes.js';
import { auditErrorMiddleware } from './middleware/auditMiddleware.js';

const app = express();

// Configuración de seguridad para limitar peticiones abuso (Rate Limit)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 120, // Máximo 120 peticiones por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many requests, please try again later.'
  }
});

// Middlewares globales de seguridad y optimización
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined'));
app.use(apiLimiter);
app.get('/api/noticias', async (req, res) => {
  try {
    const response = await fetch('https://www.infobae.com/feeds/rss/america/peru/');
    const text = await response.text();
    res.set('Content-Type', 'application/xml');
    res.send(text);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener noticias' });
  }
});

// Enlace de las rutas del proyecto
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/agents', agentRoutes);

// Manejo de error 404 - Ruta no encontrada
app.use((req, res, next) => {
  const error = new Error('Ruta no encontrada');
  error.status = 404;
  next(error);
});

app.use(auditErrorMiddleware);

// Manejo de errores global centralizado
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Error interno del servidor'
  });
});

export default app;
