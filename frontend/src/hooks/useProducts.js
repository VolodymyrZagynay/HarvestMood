import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { productService } from '../services/products';

export const useProducts = (filters = {}) => {
  const [localProducts, setLocalProducts] = useState([]);
  
  const { data: products, isLoading, error, refetch } = useQuery(
    ['products', filters],
    () => productService.getProducts(filters.search, filters.category),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      keepPreviousData: true,
    }
  );

  // Update local products when query data changes
  useEffect(() => {
    if (products) {
      setLocalProducts(products);
    }
  }, [products]);

  const searchProducts = async (searchTerm) => {
    try {
      const results = await productService.searchProducts(searchTerm);
      setLocalProducts(results);
      return results;
    } catch (err) {
      console.error('Search failed:', err);
      throw err;
    }
  };

  const filterByCategory = (category) => {
    if (!products) return;
    
    if (!category) {
      setLocalProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.CategoryName === category
      );
      setLocalProducts(filtered);
    }
  };

  const filterByPrice = (minPrice, maxPrice) => {
    if (!products) return;
    
    const filtered = products.filter(product => {
      if (minPrice && product.Price < minPrice) return false;
      if (maxPrice && product.Price > maxPrice) return false;
      return true;
    });
    
    setLocalProducts(filtered);
  };

  const sortProducts = (sortBy, sortOrder = 'asc') => {
    if (!localProducts.length) return;
    
    const sorted = [...localProducts].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.Price;
          bValue = b.Price;
          break;
        case 'name':
          aValue = a.ProductName.toLowerCase();
          bValue = b.ProductName.toLowerCase();
          break;
        case 'stock':
          aValue = a.StockQuantity;
          bValue = b.StockQuantity;
          break;
        case 'date':
          aValue = new Date(a.CreatedAt);
          bValue = new Date(b.CreatedAt);
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setLocalProducts(sorted);
  };

  return {
    products: localProducts,
    isLoading,
    error,
    refetch,
    searchProducts,
    filterByCategory,
    filterByPrice,
    sortProducts,
    totalProducts: localProducts.length
  };
};

export const useProductManagement = () => {
  const queryClient = useQueryClient();
  
  const createMutation = useMutation(
    (productData) => productService.createProduct(productData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, productData }) => productService.updateProduct(id, productData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
      },
    }
  );

  const deleteMutation = useMutation(
    (id) => productService.deleteProduct(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
      },
    }
  );

  const createProduct = async (productData) => {
    return await createMutation.mutateAsync(productData);
  };

  const updateProduct = async (id, productData) => {
    return await updateMutation.mutateAsync({ id, productData });
  };

  const deleteProduct = async (id) => {
    return await deleteMutation.mutateAsync(id);
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    isLoading: createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading,
    error: createMutation.error || updateMutation.error || deleteMutation.error
  };
};