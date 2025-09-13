// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost/backend.php', // Change this to your backend URL
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    VERIFY: '/auth/verify',
    
    // Product endpoints
    PRODUCTS: '/products',
    PRODUCT_BY_ID: (id) => `/products/${id}`,
    
    // Donation endpoints
    DONATIONS: '/donations',
    DONATION_BY_ID: (id) => `/donations/${id}`,
    DONATION_INTEREST: (id) => `/donations/${id}/interest`,
    
    // Order endpoints
    ORDERS: '/orders',
    ORDER_BY_ID: (id) => `/orders/${id}`,
    
    // Review endpoints
    REVIEWS: '/reviews',
    
    // Community endpoints
    COMMUNITY_POSTS: '/community/posts',
    POST_LIKE: (id) => `/community/posts/${id}/like`,
    POST_COMMENTS: (id) => `/community/posts/${id}/comments`,
    
    // Category endpoints
    CATEGORIES: '/categories',
    
    // Admin endpoints
    ADMIN_STATS: '/admin/stats',
    ADMIN_USERS: '/admin/users'
  }
};

// User Types
export const USER_TYPES = {
  ADMIN: 'admin',
  RESTAURANT: 'restaurant',
  USER: 'user'
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed'
};

// Payment Methods
export const PAYMENT_METHODS = {
  BKASH: 'bkash',
  NAGAD: 'nagad',
  CARD: 'card',
  COD: 'cod'
};

// Donation Status
export const DONATION_STATUS = {
  AVAILABLE: 'available',
  CLAIMED: 'claimed',
  COMPLETED: 'completed'
};

// Community Post Types
export const POST_TYPES = {
  GENERAL: 'general',
  FOOD_SHARED: 'food_shared',
  FOOD_RECEIVED: 'food_received'
};

// Food Categories
export const FOOD_CATEGORIES = {
  RICE: 'rice',
  CURRY: 'curry',
  MEAT: 'meat',
  SEAFOOD: 'seafood',
  DESSERTS: 'desserts',
  SNACKS: 'snacks'
};

// App Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id) => `/products/${id}`,
  DONATIONS: '/donations',
  DONATION_DETAIL: (id) => `/donations/${id}`,
  COMMUNITY: '/community',
  CHECKOUT: '/checkout',
  ORDER_SUCCESS: '/order-success',
  ORDER_TRACKING: (id) => `/track-order/${id}`,
  DASHBOARD: '/dashboard',
  SELLER_DASHBOARD: '/seller-dashboard',
  ADMIN: '/admin',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CART_DATA: 'food_cart',
  THEME: 'theme_preference',
  LANGUAGE: 'language_preference'
};

// Application Settings
export const APP_SETTINGS = {
  NAME: 'Food For All',
  TAGLINE: 'Connecting Communities Through Food Sharing',
  VERSION: '1.0.0',
  DEFAULT_CURRENCY: 'BDT',
  CURRENCY_SYMBOL: '৳',
  DEFAULT_DELIVERY_FEE: 50,
  DEFAULT_PAGE_SIZE: 20,
  MAX_CART_ITEMS: 50,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

// Form Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9+\-\s()]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  MAX_COMMENT_LENGTH: 500,
  MAX_POST_LENGTH: 1000,
  MAX_REVIEW_LENGTH: 500
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  LOGIN_REQUIRED: 'Please login to continue.',
  INSUFFICIENT_PERMISSIONS: 'You do not have sufficient permissions.',
  CART_EMPTY: 'Your cart is empty.',
  PRODUCT_UNAVAILABLE: 'This product is currently unavailable.',
  PAYMENT_FAILED: 'Payment processing failed. Please try again.',
  UPLOAD_FAILED: 'File upload failed. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PRODUCT_ADDED: 'Product added successfully!',
  PRODUCT_UPDATED: 'Product updated successfully!',
  PRODUCT_DELETED: 'Product deleted successfully!',
  ORDER_PLACED: 'Order placed successfully!',
  REVIEW_ADDED: 'Review added successfully!',
  COMMENT_ADDED: 'Comment added successfully!',
  POST_CREATED: 'Post created successfully!',
  DONATION_CREATED: 'Donation created successfully!',
  INTEREST_RECORDED: 'Interest recorded successfully!'
};

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  SECONDARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  }
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Date/Time Formats
export const DATE_FORMATS = {
  FULL: 'MMMM dd, yyyy',
  SHORT: 'MMM dd, yyyy',
  TIME: 'hh:mm a',
  DATETIME: 'MMM dd, yyyy hh:mm a',
  ISO: 'yyyy-MM-dd',
  TIME_ISO: 'HH:mm:ss'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PRODUCTS_PER_PAGE: 12,
  POSTS_PER_PAGE: 10,
  REVIEWS_PER_PAGE: 5
};

// Image Placeholders
export const PLACEHOLDERS = {
  USER_AVATAR: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  PRODUCT_IMAGE: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
  RESTAURANT_IMAGE: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
  FOOD_DONATION: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=300&fit=crop'
};

// Demo Credentials
export const DEMO_CREDENTIALS = [
  {
    label: 'Admin Demo',
    email: 'admin@foodforall.com',
    password: 'demo123',
    type: 'admin'
  },
  {
    label: 'Restaurant Demo',
    email: 'restaurant@demo.com',
    password: 'demo123',
    type: 'restaurant'
  },
  {
    label: 'User Demo',
    email: 'user@demo.com',
    password: 'demo123',
    type: 'user'
  }
];

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_NOTIFICATIONS: true,
  ENABLE_DARK_MODE: false,
  ENABLE_MULTI_LANGUAGE: false,
  ENABLE_ANALYTICS: true,
  ENABLE_CHAT: false,
  ENABLE_RATINGS: true,
  ENABLE_SOCIAL_LOGIN: false
};

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/foodforall',
  TWITTER: 'https://twitter.com/foodforall',
  INSTAGRAM: 'https://instagram.com/foodforall',
  LINKEDIN: 'https://linkedin.com/company/foodforall'
};

// Contact Information
export const CONTACT_INFO = {
  EMAIL: 'info@foodforall.com',
  PHONE: '+880 1700-000000',
  ADDRESS: '123 Community Street, Dhaka, Bangladesh',
  SUPPORT_EMAIL: 'support@foodforall.com',
  BUSINESS_EMAIL: 'business@foodforall.com'
};

// Map Configuration (if using maps)
export const MAP_CONFIG = {
  DEFAULT_CENTER: {
    lat: 23.8103,
    lng: 90.4125 // Dhaka, Bangladesh
  },
  DEFAULT_ZOOM: 12,
  MARKER_COLORS: {
    RESTAURANT: '#16a34a',
    DONATION: '#3b82f6',
    USER: '#6366f1'
  }
};

export default {
  API_CONFIG,
  USER_TYPES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  DONATION_STATUS,
  POST_TYPES,
  FOOD_CATEGORIES,
  ROUTES,
  STORAGE_KEYS,
  APP_SETTINGS,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  THEME_COLORS,
  NOTIFICATION_TYPES,
  DATE_FORMATS,
  PAGINATION,
  PLACEHOLDERS,
  DEMO_CREDENTIALS,
  FEATURE_FLAGS,
  SOCIAL_LINKS,
  CONTACT_INFO,
  MAP_CONFIG
};
