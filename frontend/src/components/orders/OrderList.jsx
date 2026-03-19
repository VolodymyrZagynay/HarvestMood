import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orders';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';

const OrderList = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const { data: orders, isLoading, error } = useQuery(
    'orders',
    orderService.getOrders,
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="text-yellow-500" size={16} />;
      case 'Paid':
        return <DollarSign className="text-blue-500" size={16} />;
      case 'Shipped':
        return <Truck className="text-purple-500" size={16} />;
      case 'Completed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'Cancelled':
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <AlertCircle className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Paid':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterOrders = (orders) => {
    if (!orders) return [];

    return orders.filter(order => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        order.OrderId.toString().includes(searchTerm) ||
        order.items.some(item => 
          item.ProductName.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Status filter
      const matchesStatus = statusFilter === 'all' || order.Status === statusFilter;

      // Date filter (last 30 days, last 3 months, etc.)
      const matchesDate = dateFilter === 'all' || 
        (dateFilter === '30days' && isWithinDays(order.OrderDate, 30)) ||
        (dateFilter === '3months' && isWithinDays(order.OrderDate, 90));

      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const isWithinDays = (dateString, days) => {
    const orderDate = new Date(dateString);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return orderDate >= cutoffDate;
  };

  const getTotalItems = (order) => {
    return order.items.reduce((total, item) => total + item.Quantity, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Failed to load orders
          </h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredOrders = filterOrders(orders);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Package className="mr-3" size={32} />
                My Orders
              </h1>
              <p className="text-gray-600 mt-2">
                Track and manage your orders
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Orders
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by order ID or product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="30days">Last 30 Days</option>
                <option value="3months">Last 3 Months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Package className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {orders?.length === 0 ? 'No orders yet' : 'No orders found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {orders?.length === 0 
                  ? 'Start shopping to see your orders here!'
                  : 'Try adjusting your search or filters'
                }
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFilter('all');
                }}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                {orders?.length === 0 ? 'Start Shopping' : 'Clear Filters'}
              </button>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.OrderId} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.Status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.Status)}`}>
                          {order.Status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Order #: <span className="font-mono font-medium">{order.OrderId}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1 mb-2 sm:mb-0">
                        <Calendar size={16} />
                        <span>{formatDate(order.OrderDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Package size={16} />
                        <span>{getTotalItems(order)} items</span>
                      </div>
                      <div className="flex items-center space-x-1 font-semibold text-green-600">
                        <DollarSign size={16} />
                        <span>${order.TotalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={item.OrderItemId} className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {item.ImageUrl ? (
                            <img
                              src={item.ImageUrl}
                              alt={item.ProductName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {item.ProductName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.Quantity} × ${item.UnitPrice}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${(item.Quantity * item.UnitPrice).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {order.items.length > 2 && (
                      <div className="text-center pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                          +{order.items.length - 2} more items
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                      <Link 
                        to={`/orders/${order.OrderId}`}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        View Details
                      </Link>
                    {order.Status === 'Completed' && (
                      <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm">
                        Write Review
                      </button>
                    )}
                    {order.Status === 'Shipped' && (
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                        Track Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Orders Stats */}
        {filteredOrders.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900">{orders?.length || 0}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-green-600">
                {orders?.filter(o => o.Status === 'Completed').length || 0}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {orders?.filter(o => o.Status === 'Shipped').length || 0}
              </div>
              <div className="text-sm text-gray-600">Shipped</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {orders?.filter(o => o.Status === 'Pending').length || 0}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;