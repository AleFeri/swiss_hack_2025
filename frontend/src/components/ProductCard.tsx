
import React from 'react';
import { Product } from '../types';
import { 
  Package, CreditCard, Home, Banknote, TrendingUp, 
  LineChart, BarChart3, ShieldCheck, PiggyBank, Coins 
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  highlighted?: boolean;
  suggested?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, highlighted, suggested }) => {
  // Map of category names to icons
  const getIcon = () => {
    const icons = {
      'Package': Package,
      'CreditCard': CreditCard,
      'Home': Home,
      'Banknote': Banknote,
      'TrendingUp': TrendingUp,
      'LineChart': LineChart,
      'BarChart3': BarChart3,
      'ShieldCheck': ShieldCheck,
      'PiggyBank': PiggyBank,
      'Coins': Coins
    };
    
    const IconComponent = icons[product.icon as keyof typeof icons];
    return IconComponent ? <IconComponent className="h-6 w-6" /> : null;
  };

  // Get the appropriate impact level style
  const getImpactBadge = () => {
    const classes = {
      low: 'impact-low',
      medium: 'impact-medium',
      high: 'impact-high'
    };
    
    return (
      <span className={`impact-badge ${classes[product.impactLevel]}`}>
        {product.impactLevel.charAt(0).toUpperCase() + product.impactLevel.slice(1)} Impact
      </span>
    );
  };

  return (
    <div 
      className={`product-card p-4 cursor-pointer 
        ${highlighted ? 'border-l-4 border-l-raiffeisen-red' : ''} 
        ${suggested ? 'shadow-suggested animate-fade-in' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="text-raiffeisen-red mr-3">
            {getIcon()}
          </div>
          <span className="text-xs font-medium bg-raiffeisen-lightgray px-2 py-1 rounded">
            {product.categoryLabel}
          </span>
        </div>
        {suggested && (
          <span className="text-xs font-medium bg-raiffeisen-red text-white px-2 py-1 rounded ml-auto mr-2">
            Suggested
          </span>
        )}
        {getImpactBadge()}
      </div>
      
      <h3 className="text-lg font-bold text-raiffeisen-darkgray mb-3">{product.name}</h3>
      
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-raiffeisen-darkgray mb-1">Why recommend this?</h4>
        <ul className="text-sm text-raiffeisen-mediumgray">
          {product.reasonsToSell.slice(0, 3).map((reason, index) => (
            <li key={index} className="flex items-start mb-1">
              <span className="mr-2 text-raiffeisen-red">•</span>
              <span>{reason}</span>
            </li>
          ))}
          {product.reasonsToSell.length > 3 && (
            <li className="text-xs text-right italic text-raiffeisen-mediumgray mt-1">
              + {product.reasonsToSell.length - 3} more reasons
            </li>
          )}
        </ul>
      </div>
      
      {product.documents && product.documents.length > 0 && (
        <div className="mt-3 text-xs text-raiffeisen-mediumgray">
          {product.documents.length} document{product.documents.length > 1 ? 's' : ''} available
        </div>
      )}
    </div>
  );
};

export default ProductCard;
