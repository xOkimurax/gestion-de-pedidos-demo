import React, { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "@/contexts/StoreContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Tag,
  LogOut,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title = "Panel de Administración",
  actions
}) => {
  const { logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const menuItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", path: "/admin" },
    { icon: <Package className="h-5 w-5" />, label: "Productos", path: "/admin/products" },
    { icon: <Tag className="h-5 w-5" />, label: "Categorías", path: "/admin/categories" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Menú</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  <nav className="flex-1 py-4">
                    <ul className="space-y-3">
                      {menuItems.map((item) => (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-100 text-base font-medium"
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {/* Botón de cerrar sesión para móvil */}
                    <div className="mt-8 px-3">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-base"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Cerrar Sesión
                      </Button>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            {/* Logo */}
            <h1 className="text-xl font-bold">GadgetZone Admin</h1>
          </div>
        </div>
      </header>

      {/* Sidebar and Content */}
      <div className="flex flex-1">
        {/* Sidebar - Hidden on mobile */}
        <aside className="hidden md:block w-64 bg-white shadow-sm">
          <nav className="p-4 h-full">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Botón de cerrar sesión en el menú lateral */}
            <div className="mt-8 pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start text-base"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {(title || actions) && (
            <div className="flex justify-between items-center mb-6">
              {title && title !== "Panel de Administración" && (
                <h1 className="text-2xl font-bold">{title}</h1>
              )}
              {actions && (
                <div>{actions}</div>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};