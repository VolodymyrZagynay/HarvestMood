import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/products';
import { categoryService } from '../../services/categories';
import { 
  Upload, 
  X, 
  Image as ImageIcon,
  Plus,
  Save,
  ArrowLeft
} from 'lucide-react';

const ProductForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    ProductName: '',
    Description: '',
    Price: '',
    StockQuantity: '',
    CategoryId: ''
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories
  const { data: categories } = useQuery(
    'categories',
    categoryService.getCategories,
    {
      staleTime: 10 * 60 * 1000,
    }
  );

  // Fetch product for edit mode
  const { data: existingProduct } = useQuery(
    ['product', id],
    () => productService.getProductById(id),
    {
      enabled: mode === 'edit' && !!id,
      onSuccess: (data) => {
        setFormData({
          ProductName: data.ProductName || '',
          Description: data.Description || '',
          Price: data.Price || '',
          StockQuantity: data.StockQuantity || '',
          CategoryId: data.CategoryId || ''
        });
        setImagePreviews(data.Images || []);
      }
    }
  );

  // Create product mutation
  const createMutation = useMutation(
    (formData) => productService.createProduct(formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        navigate('/dashboard/farmer');
      },
      onError: (error) => {
        setErrors({ submit: error.response?.data?.message || 'Failed to create product' });
      }
    }
  );

  // Update product mutation
  const updateMutation = useMutation(
    ({ id, formData }) => productService.updateProduct(id, formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        queryClient.invalidateQueries(['product', id]);
        navigate('/dashboard/farmer');
      },
      onError: (error) => {
        setErrors({ submit: error.response?.data?.message || 'Failed to update product' });
      }
    }
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ProductName.trim()) {
      newErrors.ProductName = 'Product name is required';
    }

    if (!formData.Description.trim()) {
      newErrors.Description = 'Description is required';
    } else if (formData.Description.length < 10) {
      newErrors.Description = 'Description must be at least 10 characters';
    }

    if (!formData.Price || parseFloat(formData.Price) <= 0) {
      newErrors.Price = 'Valid price is required';
    }

    if (!formData.StockQuantity || parseInt(formData.StockQuantity) < 0) {
      newErrors.StockQuantity = 'Valid stock quantity is required';
    }

    if (!formData.CategoryId) {
      newErrors.CategoryId = 'Category is required';
    }

    if (mode === 'create' && images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 5) {
      setErrors(prev => ({
        ...prev,
        images: 'Maximum 5 images allowed'
      }));
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);

    if (errors.images) {
      setErrors(prev => ({
        ...prev,
        images: ''
      }));
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append('ProductName', formData.ProductName);
    submitData.append('Description', formData.Description);
    submitData.append('Price', formData.Price);
    submitData.append('StockQuantity', formData.StockQuantity);
    submitData.append('CategoryId', formData.CategoryId);

    // Append images
    images.forEach(image => {
      submitData.append('images', image);
    });

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(submitData);
      } else {
        await updateMutation.mutateAsync({ id, formData: submitData });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  if (!user || user.Role !== 'Farmer') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only farmers can access this page.</p>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/farmer')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === 'create' 
              ? 'List your fresh farm products for customers to discover' 
              : 'Update your product information'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label htmlFor="ProductName" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              id="ProductName"
              name="ProductName"
              value={formData.ProductName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.ProductName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Organic Tomatoes, Fresh Apples..."
            />
            {errors.ProductName && (
              <p className="mt-1 text-sm text-red-600">{errors.ProductName}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="Description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="Description"
              name="Description"
              rows={4}
              value={formData.Description}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.Description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe your product in detail..."
            />
            {errors.Description && (
              <p className="mt-1 text-sm text-red-600">{errors.Description}</p>
            )}
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="Price" className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                id="Price"
                name="Price"
                step="0.01"
                min="0"
                value={formData.Price}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.Price ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.Price && (
                <p className="mt-1 text-sm text-red-600">{errors.Price}</p>
              )}
            </div>

            <div>
              <label htmlFor="StockQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                id="StockQuantity"
                name="StockQuantity"
                min="0"
                value={formData.StockQuantity}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.StockQuantity ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.StockQuantity && (
                <p className="mt-1 text-sm text-red-600">{errors.StockQuantity}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="CategoryId" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="CategoryId"
              name="CategoryId"
              value={formData.CategoryId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.CategoryId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category</option>
              {categories?.map(category => (
                <option key={category.CategoryId} value={category.CategoryId}>
                  {category.CategoryName}
                </option>
              ))}
            </select>
            {errors.CategoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.CategoryId}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Images {mode === 'create' && '*'}
            </label>
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              errors.images 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, JPEG up to 5MB (max 5 images)
                </p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {errors.images && (
              <p className="mt-1 text-sm text-red-600">{errors.images}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {imagePreviews.length} / 5 images selected
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard/farmer')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save size={16} />
              )}
              <span>
                {isSubmitting 
                  ? 'Saving...' 
                  : mode === 'create' ? 'Create Product' : 'Update Product'
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;