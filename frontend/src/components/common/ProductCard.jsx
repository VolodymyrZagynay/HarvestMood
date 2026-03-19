import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Star, Eye } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      addToCart(product.ProductId, 1);
    }
  };

  // Calculate average rating
  const averageRating = product.averageRating || 0; // This would come from API
  const reviewCount = product.reviewCount || 0; // This would come from API

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Product Image */}
      <div className="relative group">
        <img 
          src={product.Images?.[0] || '/api/placeholder/300/200'} 
          alt={product.ProductName}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
        
        {/* Quick Actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link 
            to={`/products/${product.ProductId}`}
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            <Eye size={16} />
          </Link>
        </div>

        {/* Stock Status */}
        {product.StockQuantity === 0 && (
          <div className="absolute top-3 left-3">
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <div className="mb-2">
          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
            {product.CategoryName}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-green-600 transition-colors">
          <Link to={`/products/${product.ProductId}`}>
            {product.ProductName}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.Description}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">
            ({reviewCount})
          </span>
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-green-600">
              ${product.Price}
            </span>
            {product.StockQuantity > 0 && (
              <span className="text-sm text-gray-500 block">
                In stock: {product.StockQuantity}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!isAuthenticated || product.StockQuantity === 0}
            className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
            title={!isAuthenticated ? "Please login to add to cart" : ""}
          >
            <ShoppingCart size={18} />
          </button>
        </div>

        {/* Farmer Info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            By <span className="font-medium text-gray-700">{product.FarmerName}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;