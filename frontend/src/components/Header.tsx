
import React from 'react';
import { Search, Menu } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="raiffeisen-container">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="text-raiffeisen-red font-bold text-2xl tracking-tight">
              RAIFFEISEN
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-raiffeisen-darkgray">
              <Search className="h-5 w-5" />
            </div>
            <div className="text-raiffeisen-darkgray">
              <Menu className="h-5 w-5" />
            </div>
          
          </div>
          <div className="md:hidden">
            <Menu className="h-6 w-6 text-raiffeisen-darkgray" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
