import { supabase } from "@/integrations/supabase/client";
import * as bcrypt from "bcryptjs";

interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
  };
  error?: string;
}

/**
 * Servicio para manejar la autenticación de usuarios
 */
class AuthService {
  /**
   * Autentica a un usuario con email y contraseña
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Respuesta con el resultado de la autenticación
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Buscar el usuario por email
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error) {
        console.error("Error al buscar el usuario:", error);
        throw new Error("Credenciales incorrectas");
      }

      if (!admin) {
        throw new Error("Credenciales incorrectas");
      }

      // Verificar si la contraseña es válida (asumiendo que está almacenada con hash)
      // La primera vez intentamos con bcrypt.compare
      try {
        const isValid = await bcrypt.compare(password, admin.password);
        
        if (!isValid) {
          // Si falla, verificamos si las contraseñas coinciden directamente (caso de desarrollo)
          if (password !== admin.password) {
            throw new Error("Credenciales incorrectas");
          }
        }
      } catch (error) {
        // Si hay un error en bcrypt.compare, podría ser porque la contraseña no está hasheada
        // Verificamos si las contraseñas coinciden directamente
        if (password !== admin.password) {
          throw new Error("Credenciales incorrectas");
        }
      }

      return {
        success: true,
        user: {
          id: admin.id,
          username: admin.username,
          email: admin.email
        }
      };
    } catch (error) {
      console.error("Error de autenticación:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido"
      };
    }
  }

  /**
   * Registra un nuevo usuario administrador
   * @param username Nombre de usuario
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Respuesta con el resultado del registro
   */
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    try {
      // Verificar si el email ya está registrado
      const { data: existingUser } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (existingUser) {
        throw new Error("El email ya está registrado");
      }

      // Cifrar la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar el nuevo usuario
      const { data: admin, error } = await supabase
        .from('admins')
        .insert([
          {
            username,
            email: email.toLowerCase(),
            password: hashedPassword
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Error al registrar usuario:", error);
        throw new Error("No se pudo crear el usuario");
      }

      return {
        success: true,
        user: {
          id: admin.id,
          username: admin.username,
          email: admin.email
        }
      };
    } catch (error) {
      console.error("Error de registro:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido"
      };
    }
  }

  /**
   * Verifica si hay un usuario autenticado en el almacenamiento de sesión
   * @returns Información del usuario si está autenticado
   */
  getAuthenticatedUser() {
    try {
      const userJson = sessionStorage.getItem('user');
      if (!userJson) return null;
      
      return JSON.parse(userJson);
    } catch (error) {
      console.error("Error al obtener usuario autenticado:", error);
      return null;
    }
  }

  /**
   * Guarda la información del usuario en el almacenamiento de sesión
   * @param user Información del usuario a guardar
   */
  setAuthenticatedUser(user: any) {
    try {
      sessionStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error("Error al guardar usuario autenticado:", error);
    }
  }

  /**
   * Cierra la sesión del usuario actual
   */
  logout() {
    try {
      sessionStorage.removeItem('user');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }
}

// Singleton para usar en toda la aplicación
export const authService = new AuthService();