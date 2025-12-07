import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, Trash2, GripVertical, ImageIcon } from 'lucide-react';

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  storage_path: string;
  position: number;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
}

export const ProductImages = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProductAndImages();
    }
  }, [productId]);

  const fetchProductAndImages = async () => {
    try {
      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id, name, category')
        .eq('id', productId)
        .single();

      if (productError) throw productError;
      setProduct(productData);

      // Fetch images
      const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('position');

      if (imagesError) throw imagesError;
      setImages(imagesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les données', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedImages: ProductImage[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${productId}/${Date.now()}-${i}.${fileExt}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        // Save to database
        const newPosition = images.length + uploadedImages.length;
        const { data: imageData, error: insertError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: publicUrl,
            storage_path: fileName,
            position: newPosition
          })
          .select()
          .single();

        if (insertError) throw insertError;
        uploadedImages.push(imageData);
      }

      setImages([...images, ...uploadedImages]);
      toast({ title: 'Succès', description: `${uploadedImages.length} image(s) ajoutée(s)` });
    } catch (error) {
      console.error('Error uploading:', error);
      toast({ title: 'Erreur', description: "Échec de l'upload", variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (image: ProductImage) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove([image.storage_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', image.id);

      if (dbError) throw dbError;

      // Update positions for remaining images
      const remainingImages = images.filter(img => img.id !== image.id);
      for (let i = 0; i < remainingImages.length; i++) {
        if (remainingImages[i].position !== i) {
          await supabase
            .from('product_images')
            .update({ position: i })
            .eq('id', remainingImages[i].id);
          remainingImages[i].position = i;
        }
      }

      setImages(remainingImages);
      toast({ title: 'Succès', description: 'Image supprimée' });
    } catch (error) {
      console.error('Error deleting:', error);
      toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' });
    }
  };

  const moveImage = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];

    // Update positions in database
    try {
      await Promise.all([
        supabase.from('product_images').update({ position: newIndex }).eq('id', images[index].id),
        supabase.from('product_images').update({ position: index }).eq('id', images[newIndex].id)
      ]);

      // Update local state with new positions
      newImages[index].position = index;
      newImages[newIndex].position = newIndex;
      setImages(newImages);
    } catch (error) {
      console.error('Error reordering:', error);
      toast({ title: 'Erreur', description: 'Impossible de réordonner', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Produit non trouvé</p>
        <Button onClick={() => navigate('/admin/products')} className="mt-4">
          Retour aux produits
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/products')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Gestion des photos</h1>
          <p className="text-muted-foreground">{product.name} - {product.category}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Photos du produit ({images.length})</span>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Upload en cours...' : 'Ajouter des photos'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Aucune photo pour ce produit</p>
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <Upload className="h-4 w-4 mr-2" />
                Ajouter des photos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div 
                  key={image.id} 
                  className="relative group border rounded-lg overflow-hidden bg-muted"
                >
                  <img 
                    src={image.image_url} 
                    alt={`${product.name} - Photo ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <div className="flex flex-col gap-1">
                      {index > 0 && (
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => moveImage(index, 'up')}
                        >
                          ↑ Monter
                        </Button>
                      )}
                      {index < images.length - 1 && (
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => moveImage(index, 'down')}
                        >
                          ↓ Descendre
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDelete(image)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 text-xs rounded">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• La première photo sera utilisée comme image principale dans la collection.</p>
          <p>• Utilisez les boutons "Monter" et "Descendre" pour réorganiser l'ordre des photos.</p>
          <p>• Les photos sont affichées sur la page produit dans l'ordre défini ici.</p>
          <p>• Formats acceptés : JPG, PNG, WebP.</p>
        </CardContent>
      </Card>
    </div>
  );
};
