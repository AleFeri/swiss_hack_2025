
export type ImpactLevel = 'low' | 'medium' | 'high';

export type ProductCategory = 
  | 'packages' 
  | 'debit-credit-cards' 
  | 'credits-loans' 
  | 'investment-solutions'
  | 'investment-products' 
  | 'investment-themes' 
  | 'mortgages' 
  | 'investment-advice' 
  | 'pension-products' 
  | 'insurance';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  description: string;
  reasonsToSell: string[];
  impactLevel: ImpactLevel;
  icon: string;
  isSuggested?: boolean;
  documents?: {
    title: string;
    url: string;
  }[];
  sellingPoints?: {
    title: string;
    points: string[];
  }[];
}

export interface Client {
  id: string;
  name: string;
  age: number;
  occupation: string;
  funFacts?: string[];
  portfolioDetails?: string;
  summary?: {
    description: string;
    meetingTip: string;
  };
}
