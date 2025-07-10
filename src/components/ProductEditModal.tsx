
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, Trash2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  categories: any[];
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  categories
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    starting_price: '',
    condition: '',
    brand: '',
    category_id: '',
    is_auction: false,
    auction_duration_hours: '24',
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description || '',
        starting_price: product.starting_price.toString(),
        condition: product.condition || '',
        brand: product.brand || '',
        category_id: product.category_id || '',
        is_auction: product.is_auction || false,
        auction_duration_hours: '24',
      });
      setImages(product.images || []);
    }
  }, [product]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Create a unique file name without the public/ prefix
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        console.log('Uploading file:', fileName);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        console.log('Upload successful:', uploadData);

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
          newImages.push(urlData.publicUrl);
          console.log('Public URL:', urlData.publicUrl);
        }
      }

      setImages(prev => [...prev, ...newImages]);
      toast({
        title: "Images uploaded",
        description: `${newImages.length} image(s) uploaded successfully.`,
      });
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
      // Reset the input value so the same file can be uploaded again if needed
      event.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!product) return;

    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Product title is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.starting_price || parseFloat(formData.starting_price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid starting price.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        starting_price: parseFloat(formData.starting_price),
        condition: formData.condition || null,
        brand: formData.brand.trim() || null,
        category_id: formData.category_id || null,
        images: images.length > 0 ? images : ['/placeholder.svg'],
        is_auction: formData.is_auction,
        auction_end_time: formData.is_auction ?
          new Date(Date.now() + parseInt(formData.auction_duration_hours) * 60 * 60 * 1000).toISOString() :
          null,
        updated_at: new Date().toISOString()
      };

      console.log('Updating product with data:', updateData);

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', product.id);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      toast({
        title: "Product updated",
        description: "Your product has been updated successfully.",
      });

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update product.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Edit Product</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} title="Close">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Starting Price (KSh) *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.starting_price}
                onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Condition</label>
              <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="like_new">Like New</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <Input
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Product Images</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                    onError={(e) => {
                      console.error('Image load error:', image);
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload-edit"
              />
              <label
                htmlFor="image-upload-edit"
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{uploadingImages ? 'Uploading...' : 'Upload Images'}</span>
              </label>
              {uploadingImages && (
                <span className="text-sm text-gray-500">Please wait...</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_auction}
                onChange={(e) => setFormData({ ...formData, is_auction: e.target.checked })}
              />
              <span className="text-sm font-medium">Enable Auction</span>
            </label>

            {formData.is_auction && (
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Duration (hours):</label>
                <Select value={formData.auction_duration_hours} onValueChange={(value) => setFormData({ ...formData, auction_duration_hours: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                    <SelectItem value="72">72 hours</SelectItem>
                    <SelectItem value="168">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={loading || uploadingImages} 
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductEditModal;
