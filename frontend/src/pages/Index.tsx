
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ClientInfo from '@/components/ClientInfo';
import SearchFilter from '@/components/SearchFilter';
import ProductCard from '@/components/ProductCard';
import ProductDialog from '@/components/ProductDialog';
import { products, suggestedProducts } from '@/data/products';
import { clients, selectedClient as defaultSelectedClient } from '@/data/clients';
import { Product, ImpactLevel, ProductCategory, Client } from '@/types';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [impactFilter, setImpactFilter] = useState<ImpactLevel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client>(defaultSelectedClient);

  // Prepare combined list of all products, with suggested ones first
  const allProducts = React.useMemo(() => {
    // Create a map of existing products to avoid duplicates
    const productMap = new Map<string, Product>();
    
    // Add suggested products first
    suggestedProducts.forEach(product => {
      productMap.set(product.id, {...product, isSuggested: true});
    });
    
    // Add all other products
    products.forEach(product => {
      if (!productMap.has(product.id)) {
        productMap.set(product.id, product);
      }
    });
    
    return Array.from(productMap.values());
  }, []);

  // Filter products based on search term and filters
  useEffect(() => {
    let result = allProducts;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply impact filter
    if (impactFilter !== 'all') {
      result = result.filter(product => product.impactLevel === impactFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(product => product.category === categoryFilter);
    }
    
    // Sort: suggested first, then by impact level
    result = result.sort((a, b) => {
      // First criteria: suggested products come first
      if ((a as any).isSuggested && !(b as any).isSuggested) return -1;
      if (!(a as any).isSuggested && (b as any).isSuggested) return 1;
      
      // Second criteria: sort by impact (high to low)
      const impactOrder = { high: 0, medium: 1, low: 2 };
      return impactOrder[a.impactLevel] - impactOrder[b.impactLevel];
    });
    
    setFilteredProducts(result);
  }, [searchTerm, impactFilter, categoryFilter, allProducts]);

  // Handle client change
  const handleClientChange = (clientId: string) => {
    const newClient = clients.find(c => c.id === clientId);
    if (newClient) {
      setSelectedClient(newClient);
    }
  };

  // Open product dialog
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  // Close product dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  // Handle product change within dialog (for suggested products)
  const handleProductChange = (newProduct: Product) => {
    setSelectedProduct(newProduct);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      
      <main className="raiffeisen-container py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-raiffeisen-darkgray mb-6">
          Pre-Meeting Opportunities
        </h1>
        
        <ClientInfo 
          client={selectedClient} 
          onClientChange={handleClientChange}
        />
        
        <SearchFilter 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          impactFilter={impactFilter}
          setImpactFilter={setImpactFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
        />
        
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => handleProductClick(product)}
                highlighted={index < 5 && !(product as any).isSuggested}
                suggested={(product as any).isSuggested}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg text-center">
            <p className="text-lg text-raiffeisen-mediumgray">No products match your search criteria</p>
          </div>
        )}
      </main>
      
      {/* Product detail dialog */}
      <ProductDialog 
        product={selectedProduct} 
        isOpen={isDialogOpen} 
        onClose={handleCloseDialog}
        onProductChange={handleProductChange}
      />
    </div>
  );
};

export default Index;
