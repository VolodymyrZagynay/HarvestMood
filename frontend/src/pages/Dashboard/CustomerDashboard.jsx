import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingBag, 
  Package, 
  Heart, 
  Settings,
  Clock,
  CheckCircle
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      icon: <ShoppingBag size={24} />,
      title: 'Continue Shopping',
      description: 'Browse fresh farm products',
      link: '/products',
      color: 'green'
    },
    {
      icon: <Package size={24} />,
      title: 'Track Orders',
      description: 'Check your order status',
      link: '/orders',
      color: 'blue'
    },
    {
      icon: <Heart size={24} />,
      title: 'Favorites',
      description: 'View your saved items',
      link: '/favorites',
      color: 'red'
    },
    {
      icon: <Settings size={24} />,
      title: 'Account Settings',
      description: 'Update your profile',
      link: '/settings',
      color: 'gray'
    }
  ];

  const recentActivities = [
    {
      icon: <CheckCircle className="text-green-500" size={16} />,
      text: 'Order #1234 delivered successfully',
      time: '2 hours ago'
    },
    {
      icon: <Clock className="text-yellow-500" size={16} />,
      text: 'Order #1235 is being processed',
      time: '1 day ago'
    },
    {
      icon: <ShoppingBag className="text-blue-500" size={16} />,
      text: 'You placed a new order',
      time: '2 days ago'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.UserName}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your farm-fresh shopping experience.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <ShoppingBag className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-gray-600">Total Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <Package className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-gray-600">Pending Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <Heart className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">8</p>
                <p className="text-gray-600">Favorite Items</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className={`p-4 border border-gray-200 rounded-lg hover:border-${action.color}-500 hover:bg-${action.color}-50 transition-colors group`}
                >
                  <div className={`text-${action.color}-600 mb-2 group-hover:text-${action.color}-700`}>
                    {action.icon}
                  </div>
                  <p className="font-medium text-gray-900 group-hover:text-gray-700">
                    {action.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {action.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900">{activity.text}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recommended For You</h2>
            <Link
              to="/products"
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              View All
            </Link>
          </div>
          <div className="text-center py-8">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">
              Personalized recommendations will appear here based on your shopping history.
            </p>
            <Link
              to="/products"
              className="inline-block mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;