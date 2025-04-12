
import React from 'react';
import { 
  Package, CreditCard, Home, Banknote, TrendingUp, 
  LineChart, BarChart3, ShieldCheck, PiggyBank, Coins 
} from 'lucide-react';

export const getCategoryIcon = (iconName: string): React.ReactNode => {
  const icons: Record<string, React.ComponentType<any>> = {
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
  
  const IconComponent = icons[iconName as keyof typeof icons];
  return IconComponent ? <IconComponent className="h-8 w-8" /> : null;
};
