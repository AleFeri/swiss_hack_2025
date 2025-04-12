
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImpactLevel, ProductCategory } from '@/types';

interface SearchFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  impactFilter: ImpactLevel | 'all';
  setImpactFilter: (value: ImpactLevel | 'all') => void;
  categoryFilter: ProductCategory | 'all';
  setCategoryFilter: (value: ProductCategory | 'all') => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  setSearchTerm,
  impactFilter,
  setImpactFilter,
  categoryFilter,
  setCategoryFilter
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-raiffeisen-mediumgray h-5 w-5" />
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select
          value={impactFilter}
          onValueChange={(value) => setImpactFilter(value as ImpactLevel | 'all')}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by impact" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Impacts</SelectItem>
              <SelectItem value="low">Low Impact</SelectItem>
              <SelectItem value="medium">Medium Impact</SelectItem>
              <SelectItem value="high">High Impact</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value as ProductCategory | 'all')}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="packages">Packages</SelectItem>
              <SelectItem value="debit-credit-cards">Debit & Credit Cards</SelectItem>
              <SelectItem value="credits-loans">Credits & Loans</SelectItem>
              <SelectItem value="investment-solutions">Investment Solutions</SelectItem>
              <SelectItem value="investment-products">Investment Products</SelectItem>
              <SelectItem value="investment-themes">Investment Themes</SelectItem>
              <SelectItem value="mortgages">Mortgages</SelectItem>
              <SelectItem value="investment-advice">Investment Advice</SelectItem>
              <SelectItem value="pension-products">Pension Products</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchFilter;
