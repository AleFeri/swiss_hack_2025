
import React from 'react';
import { Product } from '@/types';
import { getCategoryIcon } from '@/components/dialog/IconUtils';

interface SuggestedProductsSectionProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const SuggestedProductsSection: React.FC<SuggestedProductsSectionProps> = ({ products, onProductClick }) => {
  if (products.length === 0) return null;
  
  return (
    <div className="px-6 py-4 border-t border-gray-200">
      <h3 className="font-medium mb-4 text-raiffeisen-darkgray">You might also recommend:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((suggestedProduct) => (
          <div 
            key={suggestedProduct.id}
            onClick={() => onProductClick(suggestedProduct)}
            className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-2">
              <div className="text-raiffeisen-red mr-2">
                {getCategoryIcon(suggestedProduct.icon)}
              </div>
              <span className="text-xs font-medium bg-raiffeisen-lightgray px-2 py-1 rounded">
                {suggestedProduct.categoryLabel}
              </span>
            </div>
            <h4 className="font-bold text-sm mb-1">{suggestedProduct.name}</h4>
            <p className="text-xs text-raiffeisen-mediumgray line-clamp-2">
              {suggestedProduct.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedProductsSection;
