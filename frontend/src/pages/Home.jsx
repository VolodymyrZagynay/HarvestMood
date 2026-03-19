import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ProductCard } from '../components/common';
import { productService } from '../services/products';
import { categoryService } from '../services/categories';
import { 
  ArrowRight, 
  Truck, 
  Shield, 
  Star, 
  Leaf, 
  Users,
  ShoppingBag
} from 'lucide-react';

const Home = () => {
  const { data: featuredProducts } = useQuery(
    'featured-products',
    () => productService.getProducts('', ''),
    {
      select: (products) => products?.slice(0, 8) // Take first 8 products as featured
    }
  );

  const { data: categories } = useQuery(
    'categories',
    categoryService.getCategories
  );

  const features = [
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $50'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Quality Guarantee',
      description: 'Fresh from farm quality guarantee'
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: 'Organic Products',
      description: '100% organic and natural products'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Support Farmers',
      description: 'Directly support local farmers'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Fresh From Farm to Your Table
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
              Discover the freshest farm products delivered directly from local farmers. 
              Support sustainable agriculture while enjoying premium quality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingBag size={20} />
                <span>Shop Now</span>
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/about"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Harvest Mood?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We connect you directly with local farmers for the freshest experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-xl text-gray-600">
                Fresh picks from our local farmers
              </p>
            </div>
            <Link
              to="/products"
              className="hidden md:flex items-center space-x-2 text-green-600 hover:text-green-700 font-semibold"
            >
              <span>View All Products</span>
              <ArrowRight size={20} />
            </Link>
          </div>

          {featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {featuredProducts.map(product => (
                <ProductCard key={product.ProductId} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading featured products...</p>
            </div>
          )}

          <div className="text-center md:hidden">
            <Link
              to="/products"
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold inline-flex items-center space-x-2"
            >
              <span>View All Products</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600">
              Explore our wide range of farm-fresh categories
            </p>
          </div>

          {categories && categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map(category => (
                <Link
                  key={category.CategoryId}
                  to={`/products?category=${encodeURIComponent(category.CategoryName)}`}
                  className="bg-gray-50 rounded-lg p-6 text-center hover:bg-green-50 hover:border-green-200 border-2 border-transparent transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                    <Leaf size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                    {category.CategoryName}
                  </h3>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading categories...</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-green-100">
              Join thousands of satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="bg-green-500 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className="text-yellow-300 fill-current" size={20} />
                  ))}
                </div>
                <p className="text-green-50 mb-4 italic">
                  "The quality of products is amazing! Everything is so fresh and tastes incredible. 
                  I love supporting local farmers through this platform."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center font-semibold mr-3">
                    U{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">Happy Customer</p>
                    <p className="text-green-200 text-sm">Regular Shopper</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience Freshness?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of customers who enjoy fresh farm products delivered to their doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/products"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;