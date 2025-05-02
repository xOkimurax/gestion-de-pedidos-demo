/**
 * Formatea un precio como moneda (Guaraníes)
 * @param price Precio a formatear
 * @returns Precio formateado (ej: Gs. 150.000)
 */
export const formatPrice = (price: number): string => {
  return `Gs. ${Math.round(price).toLocaleString('es-PY')}`;
};

/**
 * Formatea un número para mostrar separadores de miles
 * @param value Número a formatear
 * @returns Número formateado con separadores de miles
 */
export const formatThousands = (value: number): string => {
  return Math.round(value).toLocaleString('es-PY');
};

/**
 * Formatea una fecha según el formato local (Paraguay)
 * @param date Fecha a formatear
 * @returns Fecha formateada (ej: 21/04/2025)
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-PY');
};

/**
 * Trunca un texto a un número determinado de caracteres
 * @param text Texto a truncar
 * @param length Longitud máxima (por defecto 100)
 * @returns Texto truncado con elipsis si es necesario
 */
export const truncateText = (text: string, length: number = 100): string => {
  if (!text) return '';
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

/**
 * Convierte un slug a título (formato de título)
 * @param slug Slug a convertir (ej: "mi-producto-genial")
 * @returns Título formateado (ej: "Mi Producto Genial")
 */
export const slugToTitle = (slug: string): string => {
  if (!slug) return '';
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Convierte un título a slug
 * @param title Título a convertir
 * @returns Slug generado
 */
export const titleToSlug = (title: string): string => {
  if (!title) return ''; // Corregido: verificar title en lugar de slug
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')           // Reemplaza espacios con guiones
    .replace(/[^\w\-]+/g, '')       // Elimina caracteres especiales
    .replace(/\-\-+/g, '-')         // Reemplaza múltiples guiones con uno solo
    .replace(/^-+/, '')             // Elimina guiones al inicio
    .replace(/-+$/, '');            // Elimina guiones al final
};

/**
 * Establece el título de la página
 * @param title Título de la página
 * @param withSuffix Si debe incluir el sufijo del sitio (default: true)
 */
export const setPageTitle = (title: string, withSuffix: boolean = true): void => {
  document.title = withSuffix ? `${title} | GadgetZonePy` : title;
};

/**
 * Formatea bytes a una unidad legible (KB, MB, etc)
 * @param bytes Bytes a formatear
 * @param decimals Decimales a mostrar (default: 2)
 * @returns Tamaño formateado (ej: "2.5 MB")
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};