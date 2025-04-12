
import React from 'react';
import { Product } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SuggestedProductsProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const SuggestedProducts: React.FC<SuggestedProductsProps> = ({ products, onProductClick }) => {
  // References for the scroll buttons to work
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 300; // px to scroll
      const currentScroll = scrollRef.current.scrollLeft;
      
      scrollRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - amount : currentScroll + amount,
        behavior: 'smooth'
      });
    }
  };

  if (!products.length) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-raiffeisen-darkgray">Suggested Products</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => scroll('left')}
            className="p-1 rounded-full bg-raiffeisen-lightgray hover:bg-raiffeisen-red hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-1 rounded-full bg-raiffeisen-lightgray hover:bg-raiffeisen-red hover:text-white transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <ScrollArea ref={scrollRef} className="w-full whitespace-nowrap pb-4">
        <div className="flex space-x-4">
          {products.map((product) => (
            <div key={product.id} className="min-w-[300px] max-w-[300px]" onClick={() => onProductClick(product)}>
              <div className="product-card p-4 h-full">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium bg-raiffeisen-lightgray px-2 py-1 rounded">
                    {product.categoryLabel}
                  </span>
                  <span className={`impact-badge ${product.impactLevel === 'low' ? 'impact-low' : product.impactLevel === 'medium' ? 'impact-medium' : 'impact-high'}`}>
                    {product.impactLevel.charAt(0).toUpperCase() + product.impactLevel.slice(1)}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-raiffeisen-darkgray mb-2">{product.name}</h3>
                <p className="text-sm text-raiffeisen-mediumgray line-clamp-2">{product.description}</p>
                
                <div className="mt-2 text-xs text-raiffeisen-red cursor-pointer">Click to view details</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SuggestedProducts;
