
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { ChevronLeft, MessageSquare } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { getImageUrl } from '@/integrations/supabase/client';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [inquiry, setInquiry] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (productError) throw productError;

        if (product) {
          setProduct(product);

          const { data: category, error: categoryError } = await supabase
            .from('categories')
            .select('*')
            .eq('id', product.category_id)
            .single();

          if (categoryError) throw categoryError;
          setCategory(category);
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el producto.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto py-12 text-center">
          <p>Cargando...</p>
        </div>
      </PublicLayout>
    );
  }

  if (!product) {
    return (
      <PublicLayout>
        <div className="container mx-auto py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
          <p className="mb-8">El producto que estás buscando no existe o ha sido eliminado.</p>
          <Button onClick={() => navigate("/catalog")}>Volver al Catálogo</Button>
        </div>
      </PublicLayout>
    );
  }

  const handleWhatsAppInquiry = () => {
    const phone = "+595976436290";
    const text = `Hola, quiero consultar sobre el producto "${product.name}". Mi duda es: ${inquiry}`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <PublicLayout>
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Carousel className="w-full">
              <CarouselContent>
                {product.images.length > 0 ? (
                  product.images.map((image: string, index: number) => (
                    <CarouselItem key={index}>
                      <Card>
                        <CardContent className="flex aspect-square items-center justify-center p-0">
                          <img
                            src={getImageUrl(image)}
                            alt={`${product.name} - imagen ${index + 1}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem>
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-0">
                        <img
                          src="/placeholder.svg"
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </CardContent>
                    </Card>
                  </CarouselItem>
                )}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="px-2 py-1">
                {category?.name || "Sin categoría"}
              </Badge>
            </div>

            <p className="text-2xl font-bold text-primary mb-4">
              {formatPrice(product.price)}
            </p>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Descripción</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Consulta sobre este producto
              </h2>
              <Textarea
                placeholder="Escribe tu consulta aquí..."
                value={inquiry}
                onChange={(e) => setInquiry(e.target.value)}
                className="mb-4"
                rows={4}
              />
              <Button
                onClick={handleWhatsAppInquiry}
                className="w-full"
                disabled={!inquiry.trim()}
              >
                Consultar por WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ProductDetail;
