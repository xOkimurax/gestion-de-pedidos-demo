import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { errorLogger } from '@/utils/errorLogger.ts';

// Inicializar el logger de errores antes de renderizar la aplicación
errorLogger.logInfo('Iniciando aplicación GadgetZonePy');

// Verificar que el elemento root existe
const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("No se encontró el elemento root en el DOM");
}