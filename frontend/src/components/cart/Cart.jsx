import React from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext'; // ✅ ВИПРАВЛЕНО
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight, Trash2, AlertCircle } from 'lucide-react';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import { Truck, Shield, CreditCard, Package, CheckCircle } from 'lucide-react';

const Cart = () => {
  const { cartItems, loading, clearCart } = useCart();
  const { isAuthenticated } = useAuth(); // ✅ Тепер працює
  const navigate = useNavigate();

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <ShoppingCart className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please Sign In
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to view your shopping cart.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login', { state: { from: '/cart' } })}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/products')}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ... решта коду залишається без змін
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ShoppingCart className="mr-3" size={32} />
                Shopping Cart
              </h1>
              <p className="text-gray-600 mt-2">
                Review your items and proceed to checkout
              </p>
            </div>
            
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
                <span>Clear Cart</span>
              </button>
            )}
          </div>
        </div>

        {cartItems.length === 0 ? (
          // Empty Cart State
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <ShoppingCart className="mx-auto text-gray-400 mb-4" size={80} />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any products to your cart yet. Start shopping to discover fresh farm products!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/products')}
                className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <span>Start Shopping</span>
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => navigate('/')}
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        ) : (
          // Cart with Items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Cart Header */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in cart
                  </span>
                  <span className="text-sm text-gray-600">
                    Total: ${cartItems.reduce((sum, item) => sum + (item.Price * item.Quantity), 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-4">
                {cartItems.map(item => (
                  <CartItem key={item.CartItemId} item={item} />
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <button
                  onClick={() => navigate('/products')}
                  className="w-full border border-green-500 text-green-600 py-3 rounded-lg hover:bg-green-50 transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <span>Continue Shopping</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <CartSummary />
            </div>
          </div>
        )}

        {/* Trust Badges */}
        {cartItems.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
               <Truck className="mx-auto text-green-500 mb-3" size={32} /> 
              <h4 className="font-semibold text-gray-900 mb-2">Free Shipping</h4>
              <p className="text-sm text-gray-600">
                Free shipping on orders over $50
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
              <Shield className="mx-auto text-green-500 mb-3" size={32} />
              <h4 className="font-semibold text-gray-900 mb-2">Secure Payment</h4>
              <p className="text-sm text-gray-600">
                100% secure payment processing
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
              <AlertCircle className="mx-auto text-green-500 mb-3" size={32} />
              <h4 className="font-semibold text-gray-900 mb-2">Fresh Guarantee</h4>
              <p className="text-sm text-gray-600">
                Fresh from farm quality guarantee
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;