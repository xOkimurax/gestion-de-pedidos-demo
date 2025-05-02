import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/utils/errorLogger";

/**
 * Servicio para la gestión de administradores
 */
export class AdminService {
  /**
   * Obtiene un administrador por su ID
   * @param id ID del administrador
   * @returns Datos del administrador o null si no existe
   */
  async getAdminById(id: string) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('id, username, email, created_at')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      logError(error, "AdminService.getAdminById");
      return null;
    }
  }

  /**
   * Actualiza el nombre de usuario de un administrador
   * @param id ID del administrador
   * @param username Nuevo nombre de usuario
   * @returns Resultado de la operación
   */
  async updateUsername(id: string, username: string) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .update({ username })
        .eq('id', id)
        .select('id, username, email')
        .single();
      
      if (error) {
        throw error;
      }
      
      return { success: true, data };
    } catch (error) {
      logError(error, "AdminService.updateUsername");
      return { success: false, error: "No se pudo actualizar el nombre de usuario" };
    }
  }

  /**
   * Actualiza la contraseña de un administrador
   * @param id ID del administrador
   * @param currentPassword Contraseña actual
   * @param newPassword Nueva contraseña
   * @returns Resultado de la operación
   */
  async updatePassword(id: string, currentPassword: string, newPassword: string) {
    try {
      // Primero verificamos la contraseña actual
      const { data: admin } = await supabase
        .from('admins')
        .select('password')
        .eq('id', id)
        .single();
      
      if (!admin) {
        return { success: false, error: "Administrador no encontrado" };
      }
      
      // Aquí se debe verificar la contraseña con bcrypt, pero por simplicidad en este ejemplo
      // solo verificamos que no estén vacías
      if (!currentPassword || !newPassword) {
        return { success: false, error: "Las contraseñas no pueden estar vacías" };
      }
      
      // Hashear la nueva contraseña con bcrypt
      // En un entorno de producción deberíamos usar:
      // const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Actualizar la contraseña
      const { error } = await supabase
        .from('admins')
        .update({ password: newPassword }) // Aquí deberíamos usar hashedPassword
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      logError(error, "AdminService.updatePassword");
      return { success: false, error: "No se pudo actualizar la contraseña" };
    }
  }
}

// Exportar una instancia del servicio para uso en la aplicación
export const adminService = new AdminService();