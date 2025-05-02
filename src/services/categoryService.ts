import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Tipos
export interface Category {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryFormData {
  name: string;
}

// Servicio
export class CategoryService {
  // Obtener todas las categorías
  static async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }
  
  // Crear una nueva categoría
  static async createCategory(categoryData: CategoryFormData): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: categoryData.name.trim()
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Categoría creada correctamente"
      });
      
      return data;
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la categoría",
        variant: "destructive"
      });
      return null;
    }
  }
  
  // Actualizar una categoría existente
  static async updateCategory(
    id: string, 
    categoryData: CategoryFormData
  ): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: categoryData.name.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Categoría actualizada correctamente"
      });
      
      return data;
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría",
        variant: "destructive"
      });
      return null;
    }
  }
  
  // Eliminar una categoría
  static async deleteCategory(id: string): Promise<boolean> {
    try {
      // Verificar si hay productos asociados
      const { count, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id);
        
      if (countError) throw countError;
      
      if (count && count > 0) {
        toast({
          title: "No se puede eliminar",
          description: "Esta categoría tiene productos asociados",
          variant: "destructive"
        });
        return false;
      }
      
      // Eliminar la categoría
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Categoría eliminada correctamente"
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive"
      });
      return false;
    }
  }
  
  // Obtener el conteo de productos por categoría
  static async getProductCountByCategory(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category_id');
        
      if (error) throw error;
      
      const countMap: Record<string, number> = {};
      
      (data || []).forEach(product => {
        const categoryId = product.category_id;
        countMap[categoryId] = (countMap[categoryId] || 0) + 1;
      });
      
      return countMap;
    } catch (error) {
      console.error("Error counting products by category:", error);
      return {};
    }
  }
}