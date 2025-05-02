/**
 * Servicio para el registro centralizado de errores
 */
export class ErrorLogger {
    private static instance: ErrorLogger;
    private logEndpoint = import.meta.env.VITE_LOG_ENDPOINT || '/api/log';
    private appEnvironment = import.meta.env.MODE || 'development';
    private enabled = import.meta.env.VITE_ENABLE_ERROR_LOGGING === 'true';
  
    private constructor() {
      // Configurar listener global para errores no capturados
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    }
  
    /**
     * Obtiene la instancia única del logger
     */
    public static getInstance(): ErrorLogger {
      if (!ErrorLogger.instance) {
        ErrorLogger.instance = new ErrorLogger();
      }
      return ErrorLogger.instance;
    }
  
    /**
     * Registra un error en la consola y en el servidor si está habilitado
     * @param error Error a registrar
     * @param context Contexto adicional del error
     */
    public logError(error: Error | unknown, context?: string): void {
      const errorObj = this.normalizeError(error);
      const timestamp = new Date().toISOString();
      const location = window.location.href;
      const userAgent = navigator.userAgent;
      
      // Siempre registrar en consola
      console.error(`[${timestamp}] [ERROR] [${location}] [${userAgent}] ${context || ''}: ${errorObj.message}`);
      console.error(errorObj.stack);
      
      // Enviar al servidor si está habilitado
      if (this.enabled && this.appEnvironment !== 'development') {
        this.sendToServer({
          timestamp,
          level: 'ERROR',
          message: errorObj.message,
          stack: errorObj.stack,
          context,
          location,
          userAgent,
          environment: this.appEnvironment
        });
      }
    }
  
    /**
     * Registra una advertencia en la consola y en el servidor si está habilitado
     * @param message Mensaje de advertencia
     * @param context Contexto adicional
     */
    public logWarning(message: string, context?: string): void {
      const timestamp = new Date().toISOString();
      const location = window.location.href;
      
      // Siempre registrar en consola
      console.warn(`[${timestamp}] [WARNING] [${location}] ${context || ''}: ${message}`);
      
      // Enviar al servidor si está habilitado
      if (this.enabled && this.appEnvironment !== 'development') {
        this.sendToServer({
          timestamp,
          level: 'WARNING',
          message,
          context,
          location,
          userAgent: navigator.userAgent,
          environment: this.appEnvironment
        });
      }
    }
  
    /**
     * Registra información en la consola y en el servidor si está habilitado
     * @param message Mensaje informativo
     * @param context Contexto adicional
     */
    public logInfo(message: string, context?: string): void {
      const timestamp = new Date().toISOString();
      
      // Siempre registrar en consola
      console.info(`[${timestamp}] [INFO] ${context || ''}: ${message}`);
      
      // Enviar al servidor si está habilitado
      if (this.enabled && this.appEnvironment !== 'development') {
        this.sendToServer({
          timestamp,
          level: 'INFO',
          message,
          context,
          location: window.location.href,
          userAgent: navigator.userAgent,
          environment: this.appEnvironment
        });
      }
    }
  
    /**
     * Manejador de errores globales no capturados
     */
    private handleGlobalError(event: ErrorEvent): void {
      this.logError(event.error || new Error(event.message), 'Uncaught Error');
    }
  
    /**
     * Manejador de promesas rechazadas no capturadas
     */
    private handlePromiseRejection(event: PromiseRejectionEvent): void {
      this.logError(event.reason, 'Unhandled Promise Rejection');
    }
  
    /**
     * Normaliza diferentes tipos de errores a un formato estándar
     */
    private normalizeError(error: Error | unknown): { message: string; stack?: string } {
      if (error instanceof Error) {
        return {
          message: error.message,
          stack: error.stack
        };
      }
      
      if (typeof error === 'string') {
        return {
          message: error
        };
      }
      
      return {
        message: JSON.stringify(error)
      };
    }
  
    /**
     * Envía el registro al servidor
     */
    private sendToServer(logData: any): void {
      try {
        fetch(this.logEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(logData),
          // Usar keepalive para asegurar que el registro se envíe incluso si la página se cierra
          keepalive: true
        }).catch(err => {
          // Silenciar errores de envío para evitar bucles
          console.error('Error sending log to server:', err);
        });
      } catch (err) {
        // Silenciar errores de envío para evitar bucles
        console.error('Error sending log to server:', err);
      }
    }
  }
  
  // Exportar una instancia única para usar en toda la aplicación
  export const errorLogger = ErrorLogger.getInstance();
  
  // Función de utilidad para registrar errores fácilmente
  export function logError(error: Error | unknown, context?: string): void {
    errorLogger.logError(error, context);
  }
  
  // Función de utilidad para registrar advertencias fácilmente
  export function logWarning(message: string, context?: string): void {
    errorLogger.logWarning(message, context);
  }
  
  // Función de utilidad para registrar información fácilmente
  export function logInfo(message: string, context?: string): void {
    errorLogger.logInfo(message, context);
  }