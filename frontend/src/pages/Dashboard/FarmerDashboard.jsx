import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/products';
import { orderService } from '../../services/orders';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  ShoppingBag,
  Users,
  BarChart3,
  TrendingUp,
  Eye
} from 'lucide-react';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('products');

  const { data: products, isLoading: productsLoading } = useQuery(
  'farmer-products',
  () => productService.getMyProducts(), // Використовуємо новий метод
  {
    enabled: !!user,
  }
);

  const { data: orders, isLoading: ordersLoading } = useQuery(
    'farmer-orders',
    orderService.getOrders,
    {
      enabled: !!user,
    }
  );

  const deleteMutation = useMutation(
    (productId) => productService.deleteProduct(productId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('farmer-products');
        queryClient.invalidateQueries('products');
      }
    }
  );

  // Calculate dashboard stats
  const totalProducts = products?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + order.TotalAmount, 0) || 0;
  const totalOrders = orders?.length || 0;
  const lowStockProducts = products?.filter(p => p.StockQuantity < 10).length || 0;

  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await deleteMutation.mutateAsync(productId);
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  if (!user || user.Role !== 'Farmer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            This dashboard is only available for farmers.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Farmer Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user.UserName}! Manage your products and track your sales.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <Package className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                <p className="text-gray-600">Total Products</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <DollarSign className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                <p className="text-gray-600">Total Revenue</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <ShoppingBag className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                <p className="text-gray-600">Total Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-4">
                <TrendingUp className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{lowStockProducts}</p>
                <p className="text-gray-600">Low Stock</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'products'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Products
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    My Products ({totalProducts})
                  </h2>
                  <Link
                    to="/products/new"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <Plus size={20} />
                    <span>Add New Product</span>
                  </Link>
                </div>

                {productsLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : products?.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="mx-auto text-gray-400 mb-4" size={64} />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No products yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start by adding your first product to the marketplace.
                    </p>
                    <Link
                      to="/products/new"
                      className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold inline-flex items-center space-x-2"
                    >
                      <Plus size={20} />
                      <span>Add Your First Product</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products?.map(product => (
                      <div key={product.ProductId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                            {product.Images?.[0] ? (
                              <img
                                src={product.Images[0]}
                                alt={product.ProductName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {product.ProductName}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {product.CategoryName}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-green-600 font-semibold">
                                ${product.Price}
                              </span>
                              <span className={`text-sm ${
                                product.StockQuantity > 10 ? 'text-gray-600' : 'text-red-600'
                              }`}>
                                Stock: {product.StockQuantity}
                              </span>
                              <span className="text-sm text-gray-500">
                                Added: {new Date(product.CreatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/products/${product.ProductId}`}
                            className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                            title="View Product"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            to={`/products/edit/${product.ProductId}`}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Edit Product"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product.ProductId, product.ProductName)}
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Sales Analytics
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Chart Placeholder */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <BarChart3 className="text-green-600" size={20} />
                      <h3 className="font-semibold text-gray-900">Revenue Overview</h3>
                    </div>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Revenue chart will be implemented soon
                    </div>
                  </div>

                  {/* Top Products Placeholder */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <TrendingUp className="text-green-600" size={20} />
                      <h3 className="font-semibold text-gray-900">Top Products</h3>
                    </div>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Top products analytics will be implemented soon
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 font-medium">Best Selling</p>
                    <p className="text-lg font-semibold text-green-900">Organic Tomatoes</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-medium">Monthly Revenue</p>
                    <p className="text-lg font-semibold text-blue-900">$1,234.56</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-800 font-medium">Customer Rating</p>
                    <p className="text-lg font-semibold text-purple-900">4.8/5.0</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/products/new"
              className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
            >
              <Plus className="mx-auto text-green-600 mb-2" size={24} />
              <p className="font-medium text-gray-900">Add New Product</p>
              <p className="text-sm text-gray-600">List a new farm product</p>
            </Link>
            <Link
              to="/products"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <Eye className="mx-auto text-blue-600 mb-2" size={24} />
              <p className="font-medium text-gray-900">View Marketplace</p>
              <p className="text-sm text-gray-600">Browse all products</p>
            </Link>
            <Link
              to="/orders"
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
            >
              <ShoppingBag className="mx-auto text-purple-600 mb-2" size={24} />
              <p className="font-medium text-gray-900">View Orders</p>
              <p className="text-sm text-gray-600">Check customer orders</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;