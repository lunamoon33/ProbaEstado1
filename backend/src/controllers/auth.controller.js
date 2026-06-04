import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import auditService from '../services/auditService.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '24h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en el archivo .env');
}

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      wallet: user.wallet,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, wallet, role } = req.body;

    if (!name || !email || !password || !wallet) {
      return res.status(400).json({ status: 'error', message: 'Todos los campos obligatorios deben ser proporcionados' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ status: 'error', message: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      wallet,
      role: role || 'citizen'
    });

    try {
      await auditService.logEvent({
        userId: user._id,
        action: 'REGISTER',
        description: 'User registered successfully',
        ip: req.ip || req.headers['x-forwarded-for'] || null,
        metadata: {
          email: user.email,
          role: user.role
        },
        status: 'success'
      });
    } catch (auditError) {
      console.error('[AUDIT] REGISTER log failed:', auditError?.message || auditError);
    }

    return res.status(201).json({
      status: 'success',
      message: 'Usuario registrado correctamente',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        wallet: user.wallet,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email y contraseña son obligatorios' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
    }

    const token = createToken(user);

    try {
      await auditService.logEvent({
        userId: user._id,
        action: 'LOGIN',
        description: 'User login successful',
        ip: req.ip || req.headers['x-forwarded-for'] || null,
        metadata: {
          email: user.email
        },
        status: 'success'
      });
    } catch (auditError) {
      console.error('[AUDIT] LOGIN log failed:', auditError?.message || auditError);
    }

    return res.status(200).json({
      status: 'success',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        wallet: user.wallet,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const profile = async (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      wallet: req.user.wallet,
      role: req.user.role
    }
  });
};

export const logout = async (req, res, next) => {
  try {
    try {
      await auditService.logEvent({
        userId: req.user?.id || null,
        action: 'LOGOUT',
        description: 'User logged out',
        ip: req.ip || req.headers['x-forwarded-for'] || null,
        metadata: {
          email: req.user?.email || null
        },
        status: 'success'
      });
    } catch (auditError) {
      console.error('[AUDIT] LOGOUT log failed:', auditError?.message || auditError);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};
