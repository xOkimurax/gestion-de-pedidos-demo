
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Category } from "@/hooks/useCategories";

interface EditCategoryDialogProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (category: Category) => void;
  isUpdating: boolean;
}

export const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({
  category,
  isOpen,
  onClose,
  onUpdate,
  isUpdating,
}) => {
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    if (category) {
      setEditedName(category.name);
    }
  }, [category]);

  const handleUpdateCategory = () => {
    if (category && editedName.trim()) {
      onUpdate({ ...category, name: editedName.trim() });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Categoría</DialogTitle>
          <DialogDescription>
            Actualiza el nombre de la categoría.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre de la categoría</Label>
            <Input
              id="edit-name"
              placeholder="Ej: Gadgets para hogar"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateCategory} 
            disabled={!editedName.trim() || isUpdating}
          >
            {isUpdating ? 'Actualizando...' : 'Actualizar Categoría'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
