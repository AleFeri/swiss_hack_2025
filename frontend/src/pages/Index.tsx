// src/pages/Index.tsx

import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import ClientInfo from '@/components/ClientInfo'; // Will render selected client
import SearchFilter from '@/components/SearchFilter';
import ProductCard from '@/components/ProductCard';
import ProductDialog from '@/components/ProductDialog';
// Import the function to get the client list
import { fetchClientList } from '@/data/clients'; // Adjust path if needed
// Import product data and types (assuming products are still static for now)
import { products as hardcodedProducts, suggestedProducts as hardcodedSuggested } from '@/data/products'; // Renamed imports
import { Product, ImpactLevel, ProductCategory, ClientListItem } from '@/types'; // Added ClientListItem

// Define the initial client to show (Peter Muster's ID)
const INITIAL_CLIENT_ID = '111.111.111.1';

const Index = () => {
  // State for product filtering and dialog
  const [searchTerm, setSearchTerm] = useState('');
  const [impactFilter, setImpactFilter] = useState<ImpactLevel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // --- State for client selection ---
  const [availableClients, setAvailableClients] = useState<ClientListItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(INITIAL_CLIENT_ID); // Start with Peter
  const [clientListError, setClientListError] = useState<string | null>(null);


  // Fetch available clients on component mount
  useEffect(() => {
    const loadClientList = async () => {
      setClientListError(null); // Clear previous error
      try {
        console.log("Index: Fetching client list...");
        const clientList = await fetchClientList();
        setAvailableClients(clientList);
        // Ensure the initial ID is still valid or fallback to the first available client
        if (!clientList.some(c => c.client_identifier === selectedClientId) && clientList.length > 0) {
            console.log(`Index: Initial client ID ${selectedClientId} not in list, falling back to ${clientList[0].client_identifier}`);
            setSelectedClientId(clientList[0].client_identifier);
        } else if (clientList.length === 0) {
            console.log("Index: No clients found in the list.");
            setClientListError("No clients available to display.");
        } else {
             console.log("Index: Client list fetched, initial ID is valid or list is empty.");
        }
      } catch (err: any) {
        setClientListError("Failed to load client list.");
        console.error("Client list fetch error in Index:", err);
      }
    };
    loadClientList();
  // Only run once on initial mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Product list preparation... (keep existing useMemo/useEffect for products)
  const allProducts = useMemo(() => {
    const productMap = new Map<string | number, Product>();
    const existingProductIds = new Set(hardcodedProducts.map(p => p.id));
    const validSuggestedProducts = hardcodedSuggested.filter(sp => existingProductIds.has(sp.id));
    validSuggestedProducts.forEach(product => { productMap.set(product.id, {...product, isSuggested: true}); });
    hardcodedProducts.forEach(product => { if (!productMap.has(product.id)) { productMap.set(product.id, product); } });
    return Array.from(productMap.values());
  }, []);
  useEffect(() => {
    let result = allProducts;
    if (searchTerm) { result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) || p.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase())); }
    if (impactFilter !== 'all') { result = result.filter(p => p.impactLevel === impactFilter); }
    if (categoryFilter !== 'all') { result = result.filter(p => p.category === categoryFilter); }
    result = result.sort((a, b) => { /* ... sorting logic ... */ if(a.isSuggested && !b.isSuggested) return -1; if(!a.isSuggested && b.isSuggested) return 1; const o = { high: 0, medium: 1, low: 2 }; return o[a.impactLevel] - o[b.impactLevel]; });
    setFilteredProducts(result);
  }, [searchTerm, impactFilter, categoryFilter, allProducts]);


  // --- Handler for client selection change ---
  const handleClientChange = (newClientId: string) => {
    if (newClientId && newClientId !== selectedClientId) {
        console.log("Index: Client selection changed to:", newClientId);
        setSelectedClientId(newClientId);
        // ClientInfo component will automatically re-fetch when this prop changes
    }
  };


  // Product dialog handlers (keep existing)
  const handleProductClick = (product: Product) => { setSelectedProduct(product); setIsDialogOpen(true); };
  const handleCloseDialog = () => { setIsDialogOpen(false); };
  const handleProductChange = (newProduct: Product) => { setSelectedProduct(newProduct); };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <main className="raiffeisen-container py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-raiffeisen-darkgray mb-6">
          Pre-Meeting Opportunities
        </h1>

        {/* Pass selected ID, client list, handler, and error status down to ClientInfo */}
        <ClientInfo
          clientIdentifier={selectedClientId}
          availableClients={availableClients}
          onClientChange={handleClientChange}
          clientListError={clientListError}
        />

        {/* Search/Filter and Product display remain the same */}
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          impactFilter={impactFilter}
          setImpactFilter={setImpactFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
        />
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product)}
                highlighted={index < 5 && !product.isSuggested}
                suggested={product.isSuggested}
              />
            ))}
          </div>
        ) : (
         <div className="bg-white p-8 rounded-lg text-center mt-6">
           <p className="text-lg text-raiffeisen-mediumgray">{searchTerm || impactFilter !== 'all' || categoryFilter !== 'all' ? 'No products match your search criteria' : 'Loading products...'}</p>
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