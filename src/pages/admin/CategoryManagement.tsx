import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash } from "lucide-react";
import { CategoryService, type Category } from "@/services/categoryService";
import { useToast } from "@/components/ui/use-toast";

const CategoryManagement = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<Category>({
    id: "",
    name: ""
  });
  
  // Cargar categorías y conteo de productos al iniciar
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Cargar categorías
        const categoriesData = await CategoryService.getCategories();
        setCategories(categoriesData);
        
        // Cargar conteo de productos por categoría
        const productCountData = await CategoryService.getProductCountByCategory();
        setProductCounts(productCountData);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Filtrar categorías por término de búsqueda
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setCurrentCategory({
        id: category.id,
        name: category.name
      });
    } else {
      setCurrentCategory({ id: "", name: "" });
    }
    
    setIsDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };
  
  const handleSaveCategory = async () => {
    if (!currentCategory.name.trim()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      if (currentCategory.id) {
        // Actualizar categoría existente
        const updatedCategory = await CategoryService.updateCategory(
          currentCategory.id, 
          {
            name: currentCategory.name
          }
        );
        
        if (updatedCategory) {
          setCategories(categories.map(cat => 
            cat.id === updatedCategory.id ? updatedCategory : cat
          ));
        }
      } else {
        // Crear nueva categoría
        const newCategory = await CategoryService.createCategory({
          name: currentCategory.name
        });
        
        if (newCategory) {
          setCategories([...categories, newCategory]);
        }
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDeleteCategory = async () => {
    setIsProcessing(true);
    
    try {
      // Verificar si hay productos asociados
      if (productCounts[currentCategory.id] > 0) {
        toast({
          title: "No se puede eliminar",
          description: `Esta categoría tiene ${productCounts[currentCategory.id]} productos asociados.`,
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      const success = await CategoryService.deleteCategory(currentCategory.id);
      
      if (success) {
        // Actualizar el estado local eliminando la categoría
        setCategories(categories.filter(cat => cat.id !== currentCategory.id));
        setIsDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categorías..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>
      
      <div className="bg-white rounded-md shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  Cargando categorías...
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  No se encontraron categorías
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    {productCounts[category.id] || 0} productos
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(category)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDeleteDialog(category)}>
                      <Trash className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentCategory.id ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
            <DialogDescription>
              {currentCategory.id 
                ? "Modifica los detalles de la categoría existente." 
                : "Crea una nueva categoría para organizar tus productos."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input 
                id="name" 
                value={currentCategory.name}
                onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>Cancelar</Button>
            <Button onClick={handleSaveCategory} disabled={isProcessing}>
              {isProcessing ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Categoría</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la categoría "{currentCategory.name}"?
              {productCounts[currentCategory.id] > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Esta categoría tiene {productCounts[currentCategory.id]} productos asociados.
                  No podrás eliminarla hasta que reasignes estos productos.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteCategory} 
              disabled={isProcessing || productCounts[currentCategory.id] > 0}
            >
              {isProcessing ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CategoryManagement;