
import React, { useState } from 'react';
import { Product } from '../types';
import { Pin, X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { suggestedProducts } from '@/data/products';
import DocumentsSection from '@/components/dialog/DocumentsSection';
import ReasonsSection from '@/components/dialog/ReasonsSection';
import SuggestedProductsSection from '@/components/dialog/SuggestedProductsSection';
import { getCategoryIcon } from '@/components/dialog/IconUtils';

interface ProductDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onProductChange?: (product: Product) => void;
}

const ProductDialog: React.FC<ProductDialogProps> = ({ product, isOpen, onClose, onProductChange }) => {
  const [isPinned, setIsPinned] = useState(false);
  const { toast } = useToast();
  
  const handlePinProduct = () => {
    setIsPinned(!isPinned);
    
    toast({
      title: isPinned ? "Product unpinned" : "Product pinned",
      description: isPinned 
        ? `${product?.name} has been removed from your pinned items.`
        : `${product?.name} has been added to your pinned items.`,
      duration: 3000,
    });
  };

  const handleSuggestedProductClick = (suggestedProduct: Product) => {
    if (onProductChange) {
      onProductChange(suggestedProduct);
      
      toast({
        title: "Product changed",
        description: `Viewing ${suggestedProduct.name}`,
        duration: 2000,
      });
    }
  };

  if (!product) return null;

  // Get all suggested products excluding the current one
  const filteredSuggestedProducts = suggestedProducts
    .filter(p => p.id !== product.id);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={`max-w-none w-screen h-screen p-0 rounded-none overflow-hidden flex flex-col ${
          isPinned ? 'border-4 border-raiffeisen-red' : ''
        }`}
        // Remove the default close button
        closeButton={false}
      >
        <div className={`w-full p-4 ${isPinned ? 'bg-raiffeisen-lightgray' : 'bg-white'}`}>
          <DialogHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              <div className="text-raiffeisen-red mr-4">
                {getCategoryIcon(product.icon)}
              </div>
              <div>
                <DialogTitle className="text-2xl">{product.name}</DialogTitle>
                <DialogDescription className="text-sm">
                  {product.categoryLabel}
                </DialogDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isPinned ? "default" : "outline"}
                className={`${isPinned ? 'bg-raiffeisen-red hover:bg-raiffeisen-red/90' : ''}`}
                size="sm"
                onClick={handlePinProduct}
              >
                <Pin className="h-4 w-4 mr-1" />
                {isPinned ? 'Pinned' : 'Pin Product'}
              </Button>
              <Button variant="outline" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        <div className="flex flex-col md:flex-row flex-1 gap-6 overflow-auto p-6">
          {/* Left column - Documents */}
          <div className="w-full md:w-1/2 overflow-auto flex flex-col h-full">
            <DocumentsSection documents={product.documents} />
          </div>
          
          {/* Right column - Reasons to Recommend */}
          <div className="w-full md:w-1/2 overflow-auto">
            <ReasonsSection reasons={product.reasonsToSell} />
          </div>
        </div>

        {/* Suggested Products at Bottom */}
        <SuggestedProductsSection 
          products={filteredSuggestedProducts}
          onProductClick={handleSuggestedProductClick}
        />

        <DialogFooter className="p-4 border-t border-gray-200">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
