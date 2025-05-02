
import React from "react";
import { useStore } from "@/contexts/StoreContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { getImageUrl } from '@/integrations/supabase/client';


const Dashboard = () => {
  const { products, categories } = useStore();

  // Count active and inactive products
  const activeProducts = products.filter(p => p.active).length;
  const inactiveProducts = products.length - activeProducts;
  const getFormattedDate = (product: any) => {
    if (product.created_at) return new Date(product.created_at).toLocaleDateString();
    if (product.createdAt) return new Date(product.createdAt).toLocaleDateString();
    return new Date().toLocaleDateString();
  };
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Products Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeProducts} activos, {inactiveProducts} inactivos
            </p>
          </CardContent>
        </Card>

        {/* Total Categories Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-2">
              <Button asChild size="sm" className="w-full max-w-[200px]">
                <Link to="/admin/products/new">
                  <Plus className="h-4 w-4 mr-1" />
                  Nuevo Producto
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="w-full max-w-[200px]">
                <Link to="/admin/products">Ver Productos</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="w-full max-w-[200px]">
                <Link to="/admin/categories">Ver Categorías</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Products Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Últimos Productos Agregados</h2>
        <p className="text-sm text-muted-foreground">
          Los 5 productos más recientes en el sistema
        </p>

        {/* Recent products list would go here */}
        {/* This is just a placeholder for the actual implementation */}
        <div className="mt-4 space-y-4">
          {products.slice(0, 5).map(product => (
            <div key={product.id} className="flex items-center gap-4 p-3 bg-white rounded-md shadow-sm">
              <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={getImageUrl(product.images[0])}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                ) : (
                  <span className="text-xs text-gray-500">No img</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Añadido el {getFormattedDate(product)}
                </p>
              </div>

              <div className="flex items-center">
                {product.active ? (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Activo</span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Inactivo</span>
                )}
                <Button asChild variant="ghost" size="sm" className="ml-2">
                  <Link to={`/admin/products/edit/${product.id}`}>Editar</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
