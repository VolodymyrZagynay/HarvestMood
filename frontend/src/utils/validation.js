import { VALIDATION_MESSAGES, APP_SETTINGS } from './constants';

/**
 * Required field validation
 */
export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Email validation
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation
 */
export const validatePassword = (password) => {
  return password.length >= 6;
};

/**
 * Password complexity validation
 */
export const validatePasswordComplexity = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumbers;
};

/**
 * Phone number validation
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * URL validation
 */
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Number validation
 */
export const validateNumber = (value, min = null, max = null) => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
};

/**
 * Integer validation
 */
export const validateInteger = (value, min = null, max = null) => {
  const num = parseInt(value, 10);
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
};

/**
 * Price validation
 */
export const validatePrice = (price) => {
  return validateNumber(price, 0.01);
};

/**
 * Stock quantity validation
 */
export const validateStock = (stock) => {
  return validateInteger(stock, 0);
};

/**
 * Quantity validation
 */
export const validateQuantity = (quantity) => {
  return validateInteger(quantity, 1);
};

/**
 * ZIP code validation (US format)
 */
export const validateZipCode = (zipCode) => {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
};

/**
 * Image file validation
 */
export const validateImage = (file) => {
  // Check file type
  if (!APP_SETTINGS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Invalid file type. Please upload JPEG, PNG, or WebP images.';
  }
  
  // Check file size
  if (file.size > APP_SETTINGS.MAX_IMAGE_SIZE) {
    return `File size too large. Maximum size is ${APP_SETTINGS.MAX_IMAGE_SIZE / 1024 / 1024}MB.`;
  }
  
  return null;
};

/**
 * Credit card number validation (Luhn algorithm)
 */
export const validateCreditCard = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Expiry date validation (MM/YY format)
 */
export const validateExpiryDate = (expiryDate) => {
  const re = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  if (!re.test(expiryDate)) return false;

  const [month, year] = expiryDate.split('/');
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  const expiryYear = parseInt(year, 10);
  const expiryMonth = parseInt(month, 10);

  if (expiryYear < currentYear) return false;
  if (expiryYear === currentYear && expiryMonth < currentMonth) return false;
  return true;
};

/**
 * CVV validation
 */
export const validateCVV = (cvv) => {
  const re = /^[0-9]{3,4}$/;
  return re.test(cvv);
};

/**
 * Get validation error message
 */
export const getValidationMessage = (validator, value, fieldName = 'This field') => {
  if (validator === validateRequired && !validateRequired(value)) {
    return VALIDATION_MESSAGES.REQUIRED;
  }
  
  if (validator === validateEmail && !validateEmail(value)) {
    return VALIDATION_MESSAGES.EMAIL;
  }
  
  if (validator === validatePassword && !validatePassword(value)) {
    return VALIDATION_MESSAGES.PASSWORD_MIN;
  }
  
  if (validator === validatePasswordComplexity && !validatePasswordComplexity(value)) {
    return VALIDATION_MESSAGES.PASSWORD_COMPLEXITY;
  }
  
  if (validator === validatePrice && !validatePrice(value)) {
    return VALIDATION_MESSAGES.PRICE;
  }
  
  if (validator === validateStock && !validateStock(value)) {
    return VALIDATION_MESSAGES.STOCK;
  }
  
  if (validator === validateQuantity && !validateQuantity(value)) {
    return VALIDATION_MESSAGES.QUANTITY;
  }
  
  return `${fieldName} is invalid`;
};

/**
 * Form validation helper
 */
export const createValidator = (rules) => {
  return (data) => {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
      const fieldRules = rules[field];
      const value = data[field];
      
      for (const rule of fieldRules) {
        if (rule.required && !validateRequired(value)) {
          errors[field] = rule.message || VALIDATION_MESSAGES.REQUIRED;
          break;
        }
        
        if (rule.email && !validateEmail(value)) {
          errors[field] = rule.message || VALIDATION_MESSAGES.EMAIL;
          break;
        }
        
        if (rule.minLength && value.length < rule.minLength) {
          errors[field] = rule.message || `Must be at least ${rule.minLength} characters`;
          break;
        }
        
        if (rule.maxLength && value.length > rule.maxLength) {
          errors[field] = rule.message || `Must be no more than ${rule.maxLength} characters`;
          break;
        }
        
        if (rule.pattern && !rule.pattern.test(value)) {
          errors[field] = rule.message || 'Invalid format';
          break;
        }
        
        if (rule.validate && !rule.validate(value)) {
          errors[field] = rule.message || 'Invalid value';
          break;
        }
      }
    });
    
    return errors;
  };
};

// Pre-built validators
export const loginValidator = createValidator({
  email: [
    { required: true, message: VALIDATION_MESSAGES.REQUIRED },
    { email: true, message: VALIDATION_MESSAGES.EMAIL }
  ],
  password: [
    { required: true, message: VALIDATION_MESSAGES.REQUIRED },
    { minLength: 6, message: VALIDATION_MESSAGES.PASSWORD_MIN }
  ]
});

export const registerValidator = createValidator({
  userName: [
    { required: true, message: VALIDATION_MESSAGES.REQUIRED },
    { minLength: 3, message: 'Username must be at least 3 characters' }
  ],
  email: [
    { required: true, message: VALIDATION_MESSAGES.REQUIRED },
    { email: true, message: VALIDATION_MESSAGES.EMAIL }
  ],
  password: [
    { required: true, message: VALIDATION_MESSAGES.REQUIRED },
    { minLength: 6, message: VALIDATION_MESSAGES.PASSWORD_MIN },
    { 
      validate: validatePasswordComplexity, 
      message: VALIDATION_MESSAGES.PASSWORD_COMPLEXITY 
    }
  ],
  confirmPassword: [
    { required: true, message: VALIDATION_MESSAGES.REQUIRED }
  ],
  role: [
    { required: true, message: VALIDATION_MESSAGES.REQUIRED }
  ]
});

export const productValidator = createValidator({
  ProductName: [
    { required: true, message: VALIDATION_MESSAGES.REQUIRED },
    { minLength: 3, message: 'Product name must be at least 3 characters' }
  ],
  Description: [
    { required: true, message: VALIDATION_MESSAGES.REQUIRED },
    { minLength: 10, message: 'Description must be at least 10 characters' }
  ],
  Price: [
    { required: true, message: VALIDATION_MESSAGES.REQUIRED },
    { validate: validatePrice, message: VALIDATION_MESSAGES.PRICE }
  ],
  StockQuantity: [
    { required: true, message: VALIDATION_MESSAGES.REQUIRED },
    { validate: validateStock, message: VALIDATION_MESSAGES.STOCK }
  ],
  CategoryId: [
    { required: true, message: VALIDATION_MESSAGES.REQUIRED }
  ]
});