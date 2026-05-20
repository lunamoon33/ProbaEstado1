import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI no está definido en el archivo .env');
}

export const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Atlas conectado correctamente.');
  } catch (error) {
    console.error('Error conectando con MongoDB Atlas:', error);
    throw error;
  }
};
