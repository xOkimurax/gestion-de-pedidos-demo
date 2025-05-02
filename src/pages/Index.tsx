import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/contexts/StoreContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Search, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { getImageUrl } from "@/integrations/supabase/client";

const Index = () => {
  const { products, categories, isLoadingProducts, isLoadingCategories } = useStore();

  // Mostrar un estado de carga mientras se obtienen los datos
  if (isLoadingProducts || isLoadingCategories) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Cargando contenido...</h2>
          <p className="text-muted-foreground">Por favor, espere mientras cargamos los productos.</p>
        </div>
      </PublicLayout>
    );
  }

  // Mostrar un mensaje si no hay productos o categorías
  if (!products.length && !categories.length) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">No hay contenido disponible</h2>
          <p className="text-muted-foreground mb-4">
            Lo sentimos, en este momento no podemos mostrar los productos. Por favor, intente más tarde.
          </p>
          <Button asChild>
            <Link to="/admin/login">Ir al panel de administración</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  // Obtener productos destacados
  const featuredProducts = products
    .filter(product => product.active && product.featured)
    .slice(0, 4);

  // Obtener productos más recientes
  const recentProducts = [...products]
    .filter(product => product.active)
    .sort((a, b) => {
      // Usar created_at si está disponible, o caer en fallback
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() :
        (a.createdAt instanceof Date ? a.createdAt.getTime() : 0);
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() :
        (b.createdAt instanceof Date ? b.createdAt.getTime() : 0);
      return dateB - dateA;
    })
    .slice(0, 8);

  // Obtener 4 productos aleatorios para el hero
  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const randomProducts = shuffleArray([...products].filter(product => product.active && product.images?.length > 0))
    .slice(0, 4);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                Descubre los mejores gadgets para mejorar tu día a día
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                En GadgetZonePy encontrarás los dispositivos más innovadores para el hogar y uso personal.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild>
                  <Link to="/catalog">
                    Explorar Catálogo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/catalog">
                    <Search className="mr-2 h-4 w-4" />
                    Buscar Productos
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-4">
                  <Card>
                    <CardContent className="p-0">
                      <img
                        alt={randomProducts[0]?.name || "Gadget 1"}
                        className="aspect-[4/3] object-cover rounded-lg"
                        src={randomProducts[0]?.images?.length > 0 
                          ? getImageUrl(randomProducts[0].images[0])
                          : "/placeholder.svg"}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-0">
                      <img
                        alt={randomProducts[1]?.name || "Gadget 2"}
                        className="aspect-square object-cover rounded-lg"
                        src={randomProducts[1]?.images?.length > 0 
                          ? getImageUrl(randomProducts[1].images[0])
                          : "/placeholder.svg"}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
                <div className="grid gap-4">
                  <Card>
                    <CardContent className="p-0">
                      <img
                        alt={randomProducts[2]?.name || "Gadget 3"}
                        className="aspect-square object-cover rounded-lg"
                        src={randomProducts[2]?.images?.length > 0 
                          ? getImageUrl(randomProducts[2].images[0])
                          : "/placeholder.svg"}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-0">
                      <img
                        alt={randomProducts[3]?.name || "Gadget 4"}
                        className="aspect-[4/3] object-cover rounded-lg"
                        src={randomProducts[3]?.images?.length > 0 
                          ? getImageUrl(randomProducts[3].images[0])
                          : "/placeholder.svg"}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Productos Destacados
              </h2>
              <p className="text-muted-foreground">
                Descubre nuestros productos más populares
              </p>
            </div>
            <Button variant="link" asChild className="mt-4 md:mt-0 p-0">
              <Link to="/catalog" className="flex items-center">
                Ver todos los productos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Link to={`/product/${product.id}`} key={product.id} className="group">
                  <div className="overflow-hidden rounded-lg border bg-white transition-transform hover:shadow-lg group-hover:translate-y-[-5px]">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.images && product.images.length > 0
                          ? getImageUrl(product.images[0])
                          : "/placeholder.svg"}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {product.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                        <Button size="sm" variant="ghost">
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-4 text-center py-12">
                <p className="text-muted-foreground">No hay productos destacados disponibles.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-8 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8 text-center">
            Explora por Categoría
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/catalog?category=${category.id}`}
                className="bg-white rounded-lg p-4 md:p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="font-medium">{category.name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {products.filter(p => p.category === category.id && p.active).length} productos
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Últimos Productos */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Últimas Novedades
              </h2>
              <p className="text-muted-foreground">
                Los productos más recientes en nuestro catálogo
              </p>
            </div>
            <Button variant="link" asChild className="mt-4 md:mt-0 p-0">
              <Link to="/catalog" className="flex items-center">
                Ver todos los productos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentProducts.length > 0 ? (
              recentProducts.map((product) => (
                <Link to={`/product/${product.id}`} key={product.id}>
                  <div className="overflow-hidden rounded-lg border bg-white transition-all hover:shadow-lg">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={product.images && product.images.length > 0
                          ? getImageUrl(product.images[0])
                          : "/placeholder.svg"}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">{product.name}</h3>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-4 text-center py-12">
                <p className="text-muted-foreground">No hay productos disponibles.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            ¿Listo para descubrir gadgets increíbles?
          </h2>
          <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
            Explora nuestro catálogo completo para encontrar el gadget perfecto para ti o para regalar.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/catalog">
              Explorar Todos los Productos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Index;
