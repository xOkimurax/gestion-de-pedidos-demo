/**
 * Adaptador para mantener compatibilidad entre las diferentes estructuras 
 * de producto (sistema anterior y nuevo)
 */

// Tipo del sistema anterior
export interface LegacyProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    category_id: string;
    images: string[];
    active: boolean;
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Tipo del nuevo sistema (Supabase)
  export interface SupabaseProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    category_id: string;
    images: string[];
    active: boolean;
    featured: boolean;
    created_at: string;
    updated_at: string;
  }
  
  // Función para adaptar productos de Supabase al formato legacy
  export function adaptToLegacyProduct(product: SupabaseProduct): LegacyProduct {
    return {
      ...product,
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at || product.created_at)
    };
  }
  
  // Función para adaptar productos legacy al formato Supabase
  export function adaptToSupabaseProduct(product: LegacyProduct): SupabaseProduct {
    return {
      ...product,
      created_at: product.createdAt.toISOString(),
      updated_at: product.updatedAt.toISOString()
    };
  }
  
  // Función para hacer un producto compatible con ambos sistemas
  export function makeProductCompatible(product: any): any {
    // Si ya tiene ambas propiedades, no hacer nada
    if (product.createdAt && product.created_at) {
      return product;
    }
    
    const result = { ...product };
    
    // Asegurar que tenga createdAt
    if (!result.createdAt && result.created_at) {
      result.createdAt = new Date(result.created_at);
    }
    
    // Asegurar que tenga created_at
    if (!result.created_at && result.createdAt) {
      result.created_at = result.createdAt instanceof Date 
        ? result.createdAt.toISOString() 
        : new Date(result.createdAt).toISOString();
    }
    
    // Asegurar que tenga updatedAt
    if (!result.updatedAt && result.updated_at) {
      result.updatedAt = new Date(result.updated_at);
    }
    
    // Asegurar que tenga updated_at
    if (!result.updated_at && result.updatedAt) {
      result.updated_at = result.updatedAt instanceof Date 
        ? result.updatedAt.toISOString() 
        : new Date(result.updatedAt).toISOString();
    }
    
    return result;
  }