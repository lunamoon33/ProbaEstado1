import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en el archivo .env');
}

export const authenticate = (allowedRoles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'error', message: 'Token de autorización faltante o inválido' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ status: 'error', message: 'Acceso denegado. Rol insuficiente.' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ status: 'error', message: 'Token inválido o expirado' });
    }
  };
};
