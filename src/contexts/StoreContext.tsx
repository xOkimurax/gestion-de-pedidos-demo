import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { authService } from "@/services/authService";
import { useToast } from "@/components/ui/use-toast";

// Tipos
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  active: boolean;
  featured?: boolean;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  user: User | null;
  isLoggedIn: boolean;
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, product: Partial<Omit<Product, "id">>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshProducts: () => Promise<void>;
}

// Crear el contexto
const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Provider component
export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Usar los hooks personalizados para productos y categorías
  const { 
    products, 
    isLoadingProducts, 
    addProduct: addProductMutation, 
    updateProduct: updateProductMutation,
    deleteProduct: deleteProductMutation,
    toggleProductStatus: toggleProductStatusMutation,
    refreshProducts: fetchProducts
  } = useProducts();
  
  const {
    categories,
    isLoadingCategories,
    addCategory: createCategoryMutation,
    updateCategory: updateCategoryMutation,
    deleteCategory: deleteCategoryMutation
  } = useCategories();

  // Estado del usuario
  const [user, setUser] = useState<User | null>(null);

  // Verificar si hay un usuario autenticado al cargar la aplicación
  useEffect(() => {
    const storedUser = authService.getAuthenticatedUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Adaptador para trabajar con el formato esperado de productos
  const adaptedProducts: Product[] = products.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: product.price,
    category: product.category_id,
    images: product.images || [],
    active: product.active || false,
    featured: product.featured || false,
    createdAt: new Date(product.created_at || Date.now())
  }));

  // Adaptador para addProduct
  const addProduct = (productData: Omit<Product, "id" | "createdAt">) => {
    addProductMutation(
      {
        formData: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          images: productData.images,
          active: productData.active,
          featured: productData.featured || false
        },
        newImages: []
      },
      {
        onSuccess: () => {
          toast({
            title: "Éxito",
            description: "Producto creado correctamente"
          });
        }
      }
    );
  };

  // Adaptador para updateProduct
  const updateProduct = (id: string, productData: Partial<Omit<Product, "id">>) => {
    updateProductMutation(
      {
        id,
        formData: {
          name: productData.name || "",
          description: productData.description || "",
          price: productData.price || 0,
          category: productData.category || "",
          images: productData.images || [],
          active: productData.active !== undefined ? productData.active : true,
          featured: productData.featured !== undefined ? productData.featured : false
        },
        newImages: [],
        imagesToDelete: []
      },
      {
        onSuccess: () => {
          toast({
            title: "Éxito",
            description: "Producto actualizado correctamente"
          });
        }
      }
    );
  };

  // Adaptador para deleteProduct
  const deleteProduct = (id: string) => {
    deleteProductMutation(id);
  };

  // Adaptador para toggleProductStatus
  const toggleProductStatus = (id: string) => {
    toggleProductStatusMutation(id);
  };

  // Adaptador para addCategory
  const addCategory = (categoryData: Omit<Category, "id">) => {
    if (typeof createCategoryMutation === 'function') {
      createCategoryMutation(categoryData.name);
    }
  };

  // Adaptador para updateCategory
  const updateCategory = (id: string, name: string) => {
    if (typeof updateCategoryMutation === 'function') {
      updateCategoryMutation(id, name);
    }
  };

  // Adaptador para deleteCategory
  const deleteCategory = (id: string) => {
    if (typeof deleteCategoryMutation === 'function') {
      deleteCategoryMutation(id);
    }
  };

  // Login usando el servicio de autenticación
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login(email, password);
      
      if (response.success && response.user) {
        setUser(response.user);
        authService.setAuthenticatedUser(response.user);
        return true;
      } else {
        throw new Error(response.error || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error de autenticación:", error);
      toast({
        title: "Error de inicio de sesión",
        description: error instanceof Error ? error.message : "Ocurrió un error durante el inicio de sesión",
        variant: "destructive"
      });
      return false;
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <StoreContext.Provider
      value={{
        products: adaptedProducts,
        categories,
        user,
        isLoggedIn: !!user,
        isLoadingProducts,
        isLoadingCategories,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
        addCategory,
        updateCategory,
        deleteCategory,
        login,
        logout,
        refreshProducts: fetchProducts
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};