import React from 'react';
import { useCart } from '../../context/CartContext';
import { Minus, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

const CartItem = ({ item }) => {
  const { addToCart, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(item.CartItemId);
    } else {
      // Calculate the difference to add/remove
      const difference = newQuantity - item.Quantity;
      if (difference !== 0) {
        addToCart(item.ProductId, difference);
      }
    }
  };

  const handleRemove = () => {
    removeFromCart(item.CartItemId);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Product Image */}
        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          {item.ImageUrl ? (
            <img
              src={item.ImageUrl}
              alt={item.ProductName}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-400" />
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">
            {item.ProductName}
          </h3>
          <p className="text-lg font-semibold text-green-600 mt-1">
            ${item.Price}
          </p>
          
          {/* Quantity Controls */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleQuantityChange(item.Quantity - 1)}
                className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                disabled={item.Quantity <= 1}
              >
                <Minus size={16} />
              </button>
              
              <span className="w-8 text-center font-medium text-gray-900">
                {item.Quantity}
              </span>
              
              <button
                onClick={() => handleQuantityChange(item.Quantity + 1)}
                className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Remove from cart"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Total Price */}
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            ${(item.Price * item.Quantity).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            ${item.Price} × {item.Quantity}
          </p>
        </div>
      </div>

      {/* Item Total Bar */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-sm text-gray-600">Item total:</span>
        <span className="font-semibold text-gray-900">
          ${(item.Price * item.Quantity).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default CartItem;