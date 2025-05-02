import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/contexts/StoreContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Search, Filter, Loader2 } from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { formatPrice, formatThousands } from "@/lib/format";
import { getImageUrl } from '@/integrations/supabase/client';


const Catalog = () => {
  const { products, categories, isLoadingProducts } = useStore();
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [minMaxPrice, setMinMaxPrice] = useState<[number, number]>([0, 100]);

  // Cargar productos al inicio si es necesario
  useEffect(() => {
    if (products.length === 0 && !isLoadingProducts) {
      refreshProducts();
    }
  }, [products.length, isLoadingProducts, refreshProducts]);

  // Obtener el rango de precios de los productos
  const getMinMaxPrice = (): [number, number] => {
    if (products.length === 0) return [0, 100];
    
    const prices = products.map(product => product.price);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  };

  // Inicializar el rango de precios
  useEffect(() => {
    if (products.length > 0) {
      const minMax = getMinMaxPrice();
      setMinMaxPrice(minMax);
      setPriceRange(minMax);
    }
  }, [products]);

  // Aplicar filtros
  useEffect(() => {
    console.log("Filtrando productos...");
    console.log("Productos disponibles:", products);
    console.log("Filtros:", { searchQuery, selectedCategory, priceRange });
    
    // Solo filtrar si hay productos
    if (products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let result = products.filter(product => product.active);
    console.log("Productos activos:", result.length);
  
    // Filtro por búsqueda
    if (searchQuery) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log("Después de filtro por búsqueda:", result.length);
    }
  
    // Filtro por categoría
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(product => product.category === selectedCategory);
      console.log("Después de filtro por categoría:", result.length);
    }
  
    // Filtro por rango de precios
    const [minPrice, maxPrice] = priceRange;
    result = result.filter(
      product => product.price >= minPrice && product.price <= maxPrice
    );
    console.log("Después de filtro por precio:", result.length);
  
    console.log("Productos filtrados final:", result);
    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategory, priceRange]);

  // Reiniciar filtros
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setPriceRange(getMinMaxPrice());
  };

  // Verificar la estructura de una imagen antes de mostrarla
  const getValidImageUrl = (images: string[] | null | undefined): string => {
    if (!images || images.length === 0) {
      return "/placeholder.svg";
    }
    
    return getImageUrl(images[0]);
  };

  return (
    <PublicLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Catálogo de Productos</h1>
        
        {/* Filtros */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Buscar productos..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium mb-2">Categoría</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Rango de Precio */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Rango de Precio: {priceRange[0] === 0 && priceRange[1] === 0 ? 
                  'Sin productos' : 
                  `Gs. ${formatThousands(priceRange[0])} - Gs. ${formatThousands(priceRange[1])}`}
              </label>
              <Slider
                defaultValue={[0, 100]}
                min={minMaxPrice[0]}
                max={minMaxPrice[1]}
                step={1000}
                value={[priceRange[0], priceRange[1]]}
                onValueChange={(values) => {
                  if (values.length === 2) {
                    setPriceRange([values[0], values[1]]);
                  }
                }}
                className="my-4"
              />
            </div>
          </div>
          
          {/* Botón para reiniciar filtros */}
          <Button variant="outline" onClick={resetFilters} className="mt-4">
            Reiniciar Filtros
          </Button>
        </div>
        
        {/* Productos */}
        {isLoadingProducts ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando productos...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Link to={`/product/${product.id}`} key={product.id}>
                  <Card className="h-full transition-all hover:shadow-lg">
                    <div className="aspect-square overflow-hidden bg-gray-100 rounded-t-lg">
                      <img
                        src={getValidImageUrl(product.images)}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                      <p className="text-gray-500 truncate">{product.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                      <Button size="sm">Ver Detalles</Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No se encontraron productos</h3>
                <p className="text-gray-500">Intenta con otros filtros</p>
                
                {products.length === 0 && !isLoadingProducts && (
                  <Button 
                    onClick={() => refreshProducts()} 
                    className="mt-4"
                  >
                    Intentar cargar productos nuevamente
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default Catalog;

function refreshProducts() {
  throw new Error("Function not implemented.");
}
