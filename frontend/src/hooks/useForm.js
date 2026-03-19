import { useState } from 'react';

export const useForm = (initialValues, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field on blur if validate function is provided
    if (validate) {
      const fieldErrors = validate({ [name]: values[name] });
      if (fieldErrors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: fieldErrors[name]
        }));
      }
    }
  };

  const setFieldValue = (name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const setFieldError = (name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  const validateForm = () => {
    if (!validate) return true;
    
    const formErrors = validate(values);
    setErrors(formErrors);
    
    // Mark all fields as touched to show errors
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (onSubmit) => async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    if (validate && !validateForm()) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
    validateForm
  };
};

// Pre-built form configurations
export const useLoginForm = (onSubmit) => {
  const validate = (values) => {
    const errors = {};
    
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (values.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    return errors;
  };

  return useForm({
    email: '',
    password: '',
    rememberMe: false
  }, validate);
};

export const useProductForm = (onSubmit, initialValues = {}) => {
  const validate = (values) => {
    const errors = {};
    
    if (!values.ProductName?.trim()) {
      errors.ProductName = 'Product name is required';
    }
    
    if (!values.Description?.trim()) {
      errors.Description = 'Description is required';
    } else if (values.Description.length < 10) {
      errors.Description = 'Description must be at least 10 characters';
    }
    
    if (!values.Price || parseFloat(values.Price) <= 0) {
      errors.Price = 'Valid price is required';
    }
    
    if (!values.StockQuantity || parseInt(values.StockQuantity) < 0) {
      errors.StockQuantity = 'Valid stock quantity is required';
    }
    
    if (!values.CategoryId) {
      errors.CategoryId = 'Category is required';
    }
    
    return errors;
  };

  return useForm({
    ProductName: initialValues.ProductName || '',
    Description: initialValues.Description || '',
    Price: initialValues.Price || '',
    StockQuantity: initialValues.StockQuantity || '',
    CategoryId: initialValues.CategoryId || '',
    ...initialValues
  }, validate);
};