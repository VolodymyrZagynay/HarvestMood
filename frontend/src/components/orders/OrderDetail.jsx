import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { orderService } from '../../services/orders';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Download,
  Printer,
  Star
} from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('items');

  const { data: orders, isLoading, error } = useQuery(
    'orders',
    orderService.getOrders,
    {
      enabled: !!id,
    }
  );

  // Find the specific order from the orders list
  const order = orders?.find(o => o.OrderId.toString() === id);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'Paid':
        return <DollarSign className="text-blue-500" size={20} />;
      case 'Shipped':
        return <Truck className="text-purple-500" size={20} />;
      case 'Completed':
        return <CheckCircle className="text-green-500" size={20} />;
      default:
        return <Package className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Paid':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressSteps = (status) => {
    const steps = [
      { key: 'Pending', label: 'Order Placed' },
      { key: 'Paid', label: 'Payment Confirmed' },
      { key: 'Shipped', label: 'Shipped' },
      { key: 'Completed', label: 'Delivered' }
    ];

    const currentIndex = steps.findIndex(step => step.key === status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error ? error.message : 'The order you are looking for does not exist.'}
          </p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const progressSteps = getProgressSteps(order.Status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Orders</span>
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order.OrderId}
              </h1>
              <p className="text-gray-600 mt-2">
                Placed on {formatDate(order.OrderDate)}
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download size={16} />
                <span>Invoice</span>
              </button>
              <button 
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Printer size={16} />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              {getStatusIcon(order.Status)}
              <div>
                <h3 className="font-semibold text-gray-900">Order Status</h3>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(order.Status)}`}>
                  {order.Status}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">${order.TotalAmount}</p>
              <p className="text-sm text-gray-500">Total Amount</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200"></div>
            <div className="relative flex justify-between">
              {progressSteps.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : step.current
                      ? 'bg-white border-2 border-green-500 text-green-500'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step.completed ? (
                      <CheckCircle size={16} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-2 text-center ${
                    step.completed || step.current ? 'text-green-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('items')}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'items'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Order Items ({order.items.length})
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'shipping'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Shipping Info
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'items' && (
                  <div className="space-y-4">
                    {order.items.map(item => (
                      <div key={item.OrderItemId} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {item.ImageUrl ? (
                            <img
                              src={item.ImageUrl}
                              alt={item.ProductName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900">
                            {item.ProductName}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Quantity: {item.Quantity} × ${item.UnitPrice}
                          </p>
                          {order.Status === 'Completed' && (
                            <button className="flex items-center space-x-1 text-green-600 hover:text-green-700 mt-2 text-sm">
                              <Star size={14} />
                              <span>Write Review</span>
                            </button>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${(item.Quantity * item.UnitPrice).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">Item total</p>
                        </div>
                      </div>
                    ))}

                    {/* Order Summary */}
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span>${order.TotalAmount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span>$0.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span>${(order.TotalAmount * 0.08).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                        <span>Total</span>
                        <span className="text-green-600">
                          ${(order.TotalAmount * 1.08).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Shipping Address</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="text-gray-700">123 Farm Street</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-700">Agricultural City, FC 12345</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone size={16} className="text-gray-400" />
                          <span className="text-gray-700">+1 (555) 123-4567</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail size={16} className="text-gray-400" />
                          <span className="text-gray-700">customer@example.com</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Shipping Method</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Standard Shipping</p>
                            <p className="text-sm text-gray-600">3-5 business days</p>
                          </div>
                          <span className="text-green-600 font-semibold">FREE</span>
                        </div>
                      </div>
                    </div>

                    {order.Status === 'Shipped' && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Tracking Information</h4>
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Truck className="text-blue-500" size={20} />
                            <div>
                              <p className="font-medium text-blue-900">Shipped via FarmFresh Logistics</p>
                              <p className="text-sm text-blue-700">Tracking #: FRM{order.OrderId}US</p>
                              <p className="text-sm text-blue-600 mt-1">
                                Estimated delivery: {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Actions</h3>
              <div className="space-y-3">
                {order.Status === 'Completed' && (
                  <>
                    <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm">
                      Write Product Reviews
                    </button>
                    <button className="w-full border border-green-500 text-green-600 py-2 px-4 rounded-lg hover:bg-green-50 transition-colors text-sm">
                      Reorder Items
                    </button>
                  </>
                )}
                {order.Status === 'Shipped' && (
                  <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                    Track Package
                  </button>
                )}
                {order.Status === 'Pending' && (
                  <button className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm">
                    Cancel Order
                  </button>
                )}
                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Contact Support
                </button>
              </div>
            </div>

            {/* Support Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone size={16} />
                  <span>1-800-FARM-FRESH</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail size={16} />
                  <span>support@harvestmood.com</span>
                </div>
                <p className="text-gray-500 text-xs mt-4">
                  Our support team is available 24/7 to help with your order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;