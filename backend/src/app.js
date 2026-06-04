import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import reportRoutes from './routes/report.routes.js';

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many requests, please try again later.'
  }
});

app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined'));
app.use(apiLimiter);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API principal activa' });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/noticias', async (req, res) => {
  try {
    const response = await fetch('https://rpp.pe/rss/ultimas-noticias.xml', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader)',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    });
    const text = await response.text();
    res.set('Content-Type', 'application/xml');
    res.send(text);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'No se pudo obtener el RSS' });
  }
});

app.use((req, res, next) => {
  const error = new Error('Ruta no encontrada');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Error interno del servidor'
  });
});

export default app;