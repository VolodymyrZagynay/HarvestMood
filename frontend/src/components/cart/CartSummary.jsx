import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Truck, Shield, CreditCard, AlertCircle } from 'lucide-react';

const CartSummary = () => {
  const { cartItems, getCartTotal, loading } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = getCartTotal();
  const shippingFee = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingFee + tax;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    if (cartItems.length === 0) {
      return;
    }

    setIsCheckingOut(true);
    
    // Simulate brief processing before navigating to checkout
    try {
      setTimeout(() => {
        navigate('/checkout');
        setIsCheckingOut(false);
      }, 500);
    } catch (error) {
      console.error('Checkout failed:', error);
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <ShoppingBag className="mr-2" size={20} />
        Order Summary
      </h2>

      {/* Order Details */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items ({cartItems.length})</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
        
        <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-green-600">${total.toFixed(2)}</span>
        </div>

        {/* Shipping Progress */}
        {subtotal > 0 && subtotal < 50 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-blue-800 font-medium">
                Free shipping on orders over $50
              </span>
              <span className="text-blue-600">
                ${(50 - subtotal).toFixed(2)} away
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(subtotal / 50) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={cartItems.length === 0 || isCheckingOut}
        className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center space-x-2"
      >
        {isCheckingOut ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CreditCard size={20} />
            <span>
              {isAuthenticated ? 'Proceed to Checkout' : 'Sign in to Checkout'}
            </span>
          </>
        )}
      </button>

      {/* Security Badges */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-gray-500">
          <div className="flex items-center space-x-1 text-xs">
            <Truck size={16} />
            <span>Free Shipping</span>
          </div>
          <div className="flex items-center space-x-1 text-xs">
            <Shield size={16} />
            <span>Secure Payment</span>
          </div>
        </div>
      </div>

      {/* Empty Cart Message */}
      {cartItems.length === 0 && (
        <div className="mt-6 text-center py-8">
          <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      )}

      {/* User Info for Checkout */}
      {isAuthenticated && cartItems.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Shipping to: <span className="font-medium">{user.Email}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default CartSummary;