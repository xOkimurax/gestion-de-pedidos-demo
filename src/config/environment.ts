/**
 * Configuración de entorno centralizada para la aplicación
 * Obtiene variables de entorno y proporciona valores predeterminados seguros
 */

const environment = {
    /**
     * URL base del backend
     */
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',

    /**
     * URL base de la aplicación frontend
     */
    FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:8080',
    
    /**
     * URL base de la API de Supabase
     */
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'your-supabase-project-url',
    
    /**
     * Clave anónima de Supabase (segura para uso en el frontend)
     */
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key',
    
    /**
     * Modo de la aplicación (development, test, production)
     */
    MODE: import.meta.env.MODE || 'development',
    
    /**
     * Ruta para la carga de imágenes
     * Nota: Asegúrate de reemplazar con tu URL de almacenamiento real en .env
     */
    STORAGE_URL: import.meta.env.VITE_STORAGE_URL || 'your-storage-url',
    
    /**
     * Endpoint para registro de errores
     */
    LOG_ENDPOINT: '/api/log',

    /**
     * Habilitar registro de errores en servidor
     */
    ENABLE_ERROR_LOGGING: import.meta.env.VITE_ENABLE_ERROR_LOGGING === 'true',
    
    /**
     * Verificar si estamos en modo producción
     */
    isProduction() {
      return this.MODE === 'production';
    },
    
    /**
     * Verificar si estamos en modo desarrollo
     */
    isDevelopment() {
      return this.MODE === 'development';
    },
    
    /**
     * Verificar si estamos en modo prueba
     */
    isTest() {
      return this.MODE === 'test';
    }
};

export default environment;