import { toast } from "@/components/ui/use-toast";

/**
 * Manejador centralizado de errores para la aplicación
 */
export class ErrorHandler {
  /**
   * Maneja errores de operaciones CRUD y muestra un toast
   * @param error El error capturado
   * @param operation Nombre de la operación que falló
   * @param entity Entidad sobre la que se operaba (ej. "producto", "categoría")
   */
  static handleCrudError(error: any, operation: string, entity: string) {
    console.error(`Error ${operation} ${entity}:`, error);
    
    // Determinar el mensaje apropiado según el error
    let message = `No se pudo ${operation} el ${entity}`;
    
    if (error?.message) {
      message += `: ${error.message}`;
    }
    
    // Si es un error de Supabase, puede tener más detalles
    if (error?.details || error?.hint) {
      message += ` (${error.details || error.hint})`;
    }
    
    // Mostrar toast con el error
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
    
    // Registrar para análisis en servidores de monitoreo (si existieran)
    // logErrorToServer(error, operation, entity);
    
    return error; // Devolver el error para manejo adicional si es necesario
  }
  
  /**
   * Maneja errores de operaciones de carga de archivos
   */
  static handleUploadError(error: any, fileType: string = 'archivo') {
    console.error(`Error uploading ${fileType}:`, error);
    
    toast({
      title: "Error de carga",
      description: `No se pudo cargar el ${fileType}. ${error.message || 'Verifica tu conexión e inténtalo nuevamente.'}`,
      variant: "destructive",
    });
    
    return error;
  }
  
  /**
   * Maneja errores de autenticación
   */
  static handleAuthError(error: any) {
    console.error("Error de autenticación:", error);
    
    let message = "Error de autenticación";
    if (error?.message?.includes("password")) {
      message = "Credenciales incorrectas. Por favor verifica tu correo y contraseña.";
    } else if (error?.message?.includes("network")) {
      message = "Error de conexión. Verifica tu conexión a internet.";
    } else if (error?.message) {
      message = error.message;
    }
    
    toast({
      title: "Error de acceso",
      description: message,
      variant: "destructive",
    });
    
    return error;
  }
}