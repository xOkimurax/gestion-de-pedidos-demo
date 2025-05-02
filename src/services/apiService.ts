import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/utils/errorLogger";
import environment from "@/config/environment";

// Definir un tipo para las tablas disponibles
type TableNames = "admins" | "categories" | "products" | string;

/**
 * Servicio para realizar peticiones a la API
 */
class ApiService {
  /**
   * Realiza una petición GET
   * @param endpoint Endpoint a consultar
   * @param params Parámetros de consulta
   * @returns Datos de la respuesta
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T | null> {
    try {
      const url = new URL(endpoint, environment.BASE_URL);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      logError(error, `ApiService.get: ${endpoint}`);
      return null;
    }
  }
  
  /**
   * Realiza una petición POST
   * @param endpoint Endpoint a consultar
   * @param data Datos a enviar
   * @returns Datos de la respuesta
   */
  async post<T>(endpoint: string, data: any): Promise<T | null> {
    try {
      const url = new URL(endpoint, environment.BASE_URL);
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      logError(error, `ApiService.post: ${endpoint}`);
      return null;
    }
  }
  
  /**
   * Realiza una petición PUT
   * @param endpoint Endpoint a consultar
   * @param data Datos a enviar
   * @returns Datos de la respuesta
   */
  async put<T>(endpoint: string, data: any): Promise<T | null> {
    try {
      const url = new URL(endpoint, environment.BASE_URL);
      
      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      logError(error, `ApiService.put: ${endpoint}`);
      return null;
    }
  }
  
  /**
   * Realiza una petición DELETE
   * @param endpoint Endpoint a consultar
   * @returns Datos de la respuesta
   */
  async delete<T>(endpoint: string): Promise<T | null> {
    try {
      const url = new URL(endpoint, environment.BASE_URL);
      
      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      logError(error, `ApiService.delete: ${endpoint}`);
      return null;
    }
  }
  
  /**
   * Obtiene un listado paginado de la base de datos
   * @param table Nombre de la tabla
   * @param page Número de página
   * @param pageSize Tamaño de página
   * @param filters Filtros adicionales
   * @returns Datos paginados
   */
  async getPaginated<T>(
    table: TableNames, 
    page: number = 1, 
    pageSize: number = 10,
    filters?: Record<string, any>
  ): Promise<{ data: T[], count: number } | null> {
    try {
      // Calcular el rango para la paginación
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Crear la consulta base
      // @ts-ignore
      let query: any = supabase
        .from(table as any)
        .select('*', { count: 'exact' })
        .range(from, to);
      
      // Aplicar filtros adicionales si existen
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              // Usar la función 'in' solo si hay elementos en el array
              if (value.length > 0) {
                query = query.in(key, value);
              }
            } else if (typeof value === 'object' && value !== null && 'operator' in value) {
              // Filtros con operadores personalizados: { operator: 'gt', value: 100 }
              const opValue = value as { operator: string; value: any };
              switch (opValue.operator) {
                case 'gt':
                  query = query.gt(key, opValue.value);
                  break;
                case 'lt':
                  query = query.lt(key, opValue.value);
                  break;
                case 'gte':
                  query = query.gte(key, opValue.value);
                  break;
                case 'lte':
                  query = query.lte(key, opValue.value);
                  break;
                case 'like':
                  query = query.like(key, `%${opValue.value}%`);
                  break;
                default:
                  query = query.eq(key, opValue.value);
              }
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }
      
      // Ejecutar la consulta
      const { data, error, count } = await query;
      
      if (error) {
        throw error;
      }
      
      return {
        data: data as T[],
        count: count || 0
      };
    } catch (error) {
      logError(error, `ApiService.getPaginated: ${table}`);
      return null;
    }
  }
}

// Exportar una instancia del servicio para uso en la aplicación
export const apiService = new ApiService();