import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useStore } from "@/contexts/StoreContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatThousands } from "@/lib/format";
import { 
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2, Plus, X, AlertCircle } from "lucide-react";
import { ProductService } from "@/services/productService";
import { v4 as uuidv4 } from "uuid";
import { getImageUrl } from '@/integrations/supabase/client';
import { UploadProgress } from "@/components/ui/upload-progress";

// Define interfaces
interface TempImage {
  id: string;
  file: File;
  preview: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category_id: string;
  active: boolean;
  featured: boolean;
}

interface UploadState {
  current: number;
  total: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
}

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { categories } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<TempImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnsavedChanges, setIsUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    current: 0,
    total: 0,
    status: 'idle'
  });

  // Form setup
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category_id: "",
      active: true,
      featured: false,
    },
  });

  // Load product data if in edit mode
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const product = await ProductService.getProductById(id);

        if (product) {
          form.reset({
            name: product.name,
            description: product.description,
            price: product.price,
            category_id: product.category_id,
            active: product.active,
            featured: product.featured || false,
          });

          setExistingImages(product.images || []);
        } else {
          toast({
            title: "Producto no encontrado",
            description: "El producto que intentas editar no existe",
            variant: "destructive"
          });
          navigate("/admin/products");
        }
      } catch (error) {
        console.error("Error loading product:", error);
        toast({
          title: "Error",
          description: "Error al cargar el producto. Por favor, intenta de nuevo.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate, form, toast]);

  // Handle form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setIsUnsavedChanges(true);
      // Ocultar errores de validación al hacer cambios
      setShowValidationErrors(false);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    // Validar tamaño máximo (5MB por archivo)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = Array.from(e.target.files).filter(file => file.size > maxSizeInBytes);
    
    if (oversizedFiles.length > 0) {
      toast({
        title: "Error al subir imágenes",
        description: `${oversizedFiles.length} ${oversizedFiles.length === 1 ? 'archivo excede' : 'archivos exceden'} el tamaño máximo de 5MB`,
        variant: "destructive"
      });
      
      // Filtrar archivos válidos
      const validFiles = Array.from(e.target.files).filter(file => file.size <= maxSizeInBytes);
      
      if (validFiles.length === 0) {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      // Procesar solo archivos válidos
      const newTempImages = validFiles.map(file => ({
        id: uuidv4(),
        file,
        preview: URL.createObjectURL(file)
      }));
      
      setNewImages(prev => [...prev, ...newTempImages]);
    } else {
      // Todos los archivos son válidos
      const newImageFiles = Array.from(e.target.files);
      const newTempImages = newImageFiles.map(file => ({
        id: uuidv4(),
        file,
        preview: URL.createObjectURL(file)
      }));

      setNewImages(prev => [...prev, ...newTempImages]);
    }
    
    setIsUnsavedChanges(true);
    
    // Ocultar errores de validación si ya había alguno relacionado con imágenes
    if (formErrors.some(error => error.includes("imagen"))) {
      setShowValidationErrors(false);
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle removing a new image
  const handleRemoveNewImage = (imageId: string) => {
    setNewImages(prev => {
      const filtered = prev.filter(img => img.id !== imageId);
      return filtered;
    });
    setIsUnsavedChanges(true);
  };

  // Handle removing an existing image
  const handleRemoveExistingImage = (imagePath: string) => {
    setExistingImages(prev => prev.filter(img => img !== imagePath));
    setImagesToDelete(prev => [...prev, imagePath]);
    setIsUnsavedChanges(true);
  };

  // Validate form values before submission
  const validateFormValues = (data: ProductFormData): boolean => {
    const errors: string[] = [];
    
    // Validar nombre
    if (!data.name || data.name.trim().length === 0) {
      errors.push("El nombre del producto es obligatorio");
    } else if (data.name.trim().length < 3) {
      errors.push("El nombre del producto debe tener al menos 3 caracteres");
    }

    // Validar descripción
    if (!data.description || data.description.trim().length === 0) {
      errors.push("La descripción del producto es obligatoria");
    } else if (data.description.trim().length < 10) {
      errors.push("La descripción debe tener al menos 10 caracteres");
    }
    
    // Validar precio
    if (typeof data.price !== 'number' || isNaN(data.price) || data.price <= 0) {
      errors.push("El precio debe ser mayor a 0");
    }
    
    // Validar categoría
    if (!data.category_id) {
      errors.push("Debes seleccionar una categoría");
    }
    
    // Validar imágenes - al menos una imagen es obligatoria
    if (existingImages.length === 0 && newImages.length === 0) {
      errors.push("Debes añadir al menos una imagen del producto");
    }
    
    setFormErrors(errors);
    return errors.length === 0;
  };

  // Form submission
  const onSubmit = async (formData: ProductFormData) => {
    // Validar form data
    if (!validateFormValues(formData)) {
      setShowValidationErrors(true);
      // Hacer scroll hasta el inicio del formulario donde se muestran los errores
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setUploadState({ current: 0, total: 0, status: 'uploading' });

    try {
      // Preparar los archivos de nuevas imágenes
      const imageFiles = newImages.map(img => img.file);

      if (id) {
        // Actualizar producto existente
        const result = await ProductService.updateProduct(
          id,
          formData,
          imageFiles,
          existingImages.map(img => img.startsWith('/img/') ? img.substring(5) : img),
          imagesToDelete.map(img => img.startsWith('/img/') ? img.substring(5) : img),
          (progress) => {
            setUploadState({ ...progress, status: progress.status });
          }
        );
        
        if (result) {
          setUploadState(prev => ({ ...prev, status: 'success' }));
          setShowSuccessDialog(true);
          setIsUnsavedChanges(false);
        } else {
          throw new Error("No se pudo actualizar el producto");
        }
      } else {
        // Crear nuevo producto
        const result = await ProductService.createProduct(
          formData, 
          imageFiles,
          (progress) => {
            setUploadState({ ...progress, status: progress.status });
          }
        );
        
        if (result) {
          setUploadState(prev => ({ ...prev, status: 'success' }));
          setShowSuccessDialog(true);
          setIsUnsavedChanges(false);
        } else {
          throw new Error("No se pudo crear el producto");
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      setUploadState(prev => ({ ...prev, status: 'error' }));
      toast({
        title: "Error",
        description: "Ha ocurrido un error al guardar el producto. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle navigation with unsaved changes
  const handleNavigation = (path: string) => {
    if (isUnsavedChanges) {
      setPendingNavigation(path);
      setShowConfirmDialog(true);
    } else {
      navigate(path);
    }
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      newImages.forEach(image => URL.revokeObjectURL(image.preview));
    };
  }, [newImages]);

  // Guardar cuando se presione Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!isSubmitting && form.formState.isDirty) {
          form.handleSubmit(onSubmit)();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [form, isSubmitting, onSubmit]);

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">{id ? "Editar Producto" : "Nuevo Producto"}</h1>
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => handleNavigation("/admin/products")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a Productos
      </Button>

      {/* Errores de validación */}
      {showValidationErrors && formErrors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de validación</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 mt-2">
              {formErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando...</span>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ 
                    required: "El nombre es obligatorio",
                    minLength: {
                      value: 3,
                      message: "El nombre debe tener al menos 3 caracteres"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del producto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Auriculares Bluetooth" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  rules={{ 
                    required: "La descripción es obligatoria",
                    minLength: {
                      value: 10,
                      message: "La descripción debe tener al menos 10 caracteres"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe el producto..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  rules={{
                    required: "El precio es obligatorio",
                    validate: (value) => (!isNaN(value) && value > 0) || "El precio debe ser mayor a 0"
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="0"
                          {...field}
                          onChange={(e) => {
                            // Eliminar todo excepto números
                            const numericValue = e.target.value.replace(/[^\d]/g, '');
                            // Convertir a número
                            const value = numericValue === '' ? 0 : parseInt(numericValue, 10);
                            // Actualizar el valor numérico en el formulario
                            field.onChange(value);
                          }}
                          // Mostrar el valor formateado con separadores de miles
                          value={field.value ? formatThousands(field.value) : ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Precio en guaraníes (Gs.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category_id"
                  rules={{ required: "La categoría es obligatoria" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                        defaultValue=""
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories && categories.length > 0 ? (
                            categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center text-muted-foreground">No hay categorías disponibles</div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {categories.length === 0 && (
                          <span className="text-destructive">
                            No hay categorías disponibles. Debes crear al menos una categoría antes de continuar.
                          </span>
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-4">
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 flex-1">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Activo</FormLabel>
                          <FormDescription>
                            El producto estará visible en la tienda
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 flex-1">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Destacado</FormLabel>
                          <FormDescription>
                            Aparecerá en la sección de destacados
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <Label htmlFor="images">
                    Imágenes del producto 
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <FormDescription>
                    Al menos una imagen es obligatoria. Formatos permitidos: PNG, JPG o WEBP (máx. 5MB)
                  </FormDescription>
                  <div className="mt-2">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="image-upload"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                          formErrors.some(error => error.includes("imagen")) && showValidationErrors 
                            ? "border-destructive" 
                            : ""
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Plus className={`w-8 h-8 mb-2 ${
                            formErrors.some(error => error.includes("imagen")) && showValidationErrors 
                              ? "text-destructive" 
                              : "text-gray-500"
                          }`} />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG o WEBP (máx. 5MB)
                          </p>
                        </div>
                        <input
                          id="image-upload"
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageSelect}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  {existingImages.map((image, index) => (
                    <div key={image} className="relative group">
                      <div className="aspect-square overflow-hidden rounded-md border bg-muted">
                        <img
                          src={getImageUrl(image.startsWith('/img/') ? image.substring(5) : image)}
                          alt={`Producto ${index + 1}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            console.log("Error loading image:", image);
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(image)}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={existingImages.length + newImages.length <= 1}
                        title={existingImages.length + newImages.length <= 1 ? "Al menos una imagen es obligatoria" : "Eliminar imagen"}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  ))}

                  {newImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square overflow-hidden rounded-md border bg-muted">
                        <img
                          src={image.preview}
                          alt="Nueva imagen"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(image.id)}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={existingImages.length + newImages.length <= 1}
                        title={existingImages.length + newImages.length <= 1 ? "Al menos una imagen es obligatoria" : "Eliminar imagen"}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>

                {existingImages.length === 0 && newImages.length === 0 && (
                  <p className={`text-sm mt-2 ${formErrors.some(error => error.includes("imagen")) && showValidationErrors ? "text-destructive" : "text-muted-foreground"}`}>
                    Añade al menos una imagen del producto
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {uploadState.status === 'uploading' && (
                <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed inset-x-0 bottom-0 border-t py-4 px-8">
                  <UploadProgress
                    current={uploadState.current}
                    total={uploadState.total}
                    label="Subiendo imágenes..."
                  />
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleNavigation("/admin/products")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || uploadState.status === 'uploading'}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {id ? "Actualizar Producto" : "Crear Producto"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      )}

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¡Operación exitosa!</AlertDialogTitle>
            <AlertDialogDescription>
              {id 
                ? "El producto se ha actualizado correctamente."
                : "El producto se ha creado correctamente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => {
                setShowSuccessDialog(false);
                navigate("/admin/products");
              }}
            >
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation dialog for unsaved changes */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Descartar cambios?</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setShowConfirmDialog(false);
                setIsUnsavedChanges(false);
                if (pendingNavigation) {
                  navigate(pendingNavigation);
                }
              }}
            >
              Descartar cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductForm;