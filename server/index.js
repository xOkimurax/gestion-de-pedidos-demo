import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import logRouter from './api/log.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Configurar CORS para permitir solicitudes desde la aplicación frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://gadgetzonepy.netlify.app/',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Middleware para parsear JSON
app.use(express.json());

// Usar el router de logs
app.use('/api', logRouter);

// Configurar puerto desde variable de entorno
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Iniciar el servidor
app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});