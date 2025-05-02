import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/contexts/StoreContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface PublicLayoutProps {
  children: ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const { categories } = useStore();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center gap-3 md:gap-6">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] sm:w-[440px] lg:w-[640px]">
                <SheetHeader className="border-b pb-4 mb-4">
                  <SheetTitle>Menú</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4">
                  <nav className="flex flex-col gap-3">
                    <Link
                      to="/"
                      className="text-base font-medium hover:text-primary py-2"
                    >
                      Inicio
                    </Link>
                    <Link
                      to="/catalog"
                      className="text-base font-medium hover:text-primary py-2"
                    >
                      Catálogo
                    </Link>
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/catalog?category=${category.id}`}
                        className="text-base font-medium hover:text-primary py-2"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <Link to="/" className="flex items-center gap-2 font-bold">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span className="hidden sm:inline-block">GadgetZonePy</span>
            </Link>
            <nav className="hidden lg:flex lg:gap-6 lg:text-sm">
              <Link
                to="/"
                className={cn(
                  "flex items-center font-medium transition-colors hover:text-primary"
                )}
              >
                Inicio
              </Link>
              <Link
                to="/catalog"
                className={cn(
                  "flex items-center font-medium transition-colors hover:text-primary"
                )}
              >
                Catálogo
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
      
      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="container flex flex-col gap-6 py-8 md:flex-row md:justify-between">
          <div className="flex flex-col gap-2">
            <Link to="/" className="flex items-center gap-2 font-bold">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span>GadgetZonePy</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Catálogo de gadgets para el hogar y otros usos.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Categorías</h3>
              <nav className="flex flex-col gap-2">
                {categories.slice(0, 4).map((category) => (
                  <Link
                    key={category.id}
                    to={`/catalog?category=${category.id}`}
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Navegación</h3>
              <nav className="flex flex-col gap-2">
                <Link
                  to="/"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Inicio
                </Link>
                <Link
                  to="/catalog"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Catálogo
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Contacto</h3>
              <p className="text-sm text-muted-foreground">
                Tel: +595976436290
              </p>
              <p className="text-sm text-muted-foreground">
                Email: contacto@gadgetzone.py
              </p>
            </div>
          </div>
        </div>
        <div className="container py-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} GadgetZonePy. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};
