// /**
//  * API Service for MO Approval System
//  * Handles all backend API calls with:
//  * - Proper error handling
//  * - Retry logic for intermittent failures
//  * - Request/response logging
//  * - User-friendly error messages
//  * - Environment configuration
//  */

// import axios from 'axios';

// // ============================================================================
// // CONFIGURATION
// // ============================================================================

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
// const REQUEST_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);
// const RETRY_ATTEMPTS = 3;
// const RETRY_DELAY = 1000; // milliseconds
// const DEBUG_MODE = import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true';

// // ============================================================================
// // AXIOS INSTANCE
// // ============================================================================

// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: REQUEST_TIMEOUT,
//   headers: {
//     'Content-Type': 'application/json',
//   }
// });

// // ============================================================================
// // REQUEST INTERCEPTOR - Log outgoing requests
// // ============================================================================

// apiClient.interceptors.request.use(
//   config => {
//     if (DEBUG_MODE) {
//       console.group('📡 API Request');
//       console.log('Method:', config.method.toUpperCase());
//       console.log('Endpoint:', config.url);
//       console.log('Full URL:', `${config.baseURL}${config.url}`);
//       console.log('Params:', config.params);
//       console.log('Data:', config.data);
//       console.log('Timestamp:', new Date().toISOString());
//       console.groupEnd();
//     }
//     return config;
//   },
//   error => {
//     console.error('❌ Request Configuration Error:', error);
//     return Promise.reject(error);
//   }
// );

// // ============================================================================
// // RESPONSE INTERCEPTOR - Log responses and handle errors
// // ============================================================================

// apiClient.interceptors.response.use(
//   response => {
//     if (DEBUG_MODE) {
//       console.group('✅ API Response Success');
//       console.log('Status:', response.status);
//       console.log('Endpoint:', response.config.url);
//       console.log('Data Length:', Array.isArray(response.data) ? response.data.length : 'N/A');
//       console.log('Timestamp:', new Date().toISOString());
//       console.groupEnd();
//     }
//     return response;
//   },
//   error => {
//     // Log error details
//     const errorDetails = {
//       status: error.response?.status,
//       statusText: error.response?.statusText,
//       url: error.config?.url,
//       fullUrl: `${error.config?.baseURL}${error.config?.url}`,
//       message: error.message,
//       code: error.code,
//       timestamp: new Date().toISOString()
//     };

//     console.error('❌ API Error:', errorDetails);

//     // Store error details for debugging
//     error.debugDetails = errorDetails;

//     return Promise.reject(error);
//   }
// );

// // ============================================================================
// // UTILITY FUNCTIONS
// // ============================================================================

// /**
//  * Retry a failed API request
//  * @param {Function} requestFn - The function to retry
//  * @param {number} retries - Number of retry attempts
//  * @param {number} delayMs - Delay between retries in milliseconds
//  * @returns {Promise} - The result of the successful request
//  */
// const retryRequest = async (requestFn, retries = RETRY_ATTEMPTS, delayMs = RETRY_DELAY) => {
//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       if (DEBUG_MODE) {
//         console.log(`🔄 API Attempt ${attempt}/${retries}`);
//       }
//       return await requestFn();
//     } catch (error) {
//       const isLastAttempt = attempt === retries;
      
//       if (isLastAttempt) {
//         console.error(`❌ All ${retries} retry attempts failed`);
//         throw error;
//       }

//       // Only retry on network errors or 5xx errors
//       const shouldRetry = 
//         !error.response || // Network error
//         error.response.status >= 500; // Server error

//       if (shouldRetry) {
//         console.warn(`⚠️ Request failed, retrying in ${delayMs}ms... (${attempt}/${retries})`);
//         await new Promise(resolve => setTimeout(resolve, delayMs));
//       } else {
//         // Don't retry on 4xx errors (except 408, 429)
//         throw error;
//       }
//     }
//   }
// };

// /**
//  * Get user-friendly error message
//  * @param {Error} error - The error object
//  * @returns {string} - User-friendly error message
//  */
// const getErrorMessage = (error) => {
//   // Check for specific HTTP status codes
//   if (error.response) {
//     switch (error.response.status) {
//       case 400:
//         return 'Invalid request. Please check your input.';
//       case 401:
//         return 'Your session has expired. Please login again.';
//       case 403:
//         return 'You do not have permission to perform this action.';
//       case 404:
//         return 'The requested resource was not found. Please contact support.';
//       case 408:
//         return 'Request timeout. Please try again.';
//       case 429:
//         return 'Too many requests. Please wait a moment and try again.';
//       case 500:
//         return 'Server error. Please try again later.';
//       case 502:
//         return 'Bad Gateway. Please try again later.';
//       case 503:
//         return 'Service temporarily unavailable. Please try again later.';
//       case 504:
//         return 'Server timeout. Please try again later.';
//       default:
//         return error.response.data?.message || `Error: ${error.response.status} ${error.response.statusText}`;
//     }
//   }

//   // Check for network errors
//   if (error.code === 'ECONNABORTED') {
//     return 'Request timeout. Please check your internet connection.';
//   }

//   if (error.message === 'Network Error') {
//     return 'Network error. Please check your internet connection.';
//   }

//   if (error.code === 'ENOTFOUND') {
//     return 'Cannot reach the server. Please check the API configuration.';
//   }

//   // Default error message
//   return error.message || 'An unexpected error occurred. Please try again.';
// };

// // ============================================================================
// // API SERVICE METHODS
// // ============================================================================

// export const moApprovalService = {
  
//   /**
//    * Get maintenance orders list
//    * @param {Object} filters - Filter parameters
//    * @param {string} filters.orderNumber - Filter by order number
//    * @param {string} filters.plant - Filter by plant
//    * @param {string} filters.location - Filter by location
//    * @param {string} filters.user - Filter by user
//    * @param {string} filters.status - Filter by status
//    * @returns {Promise<AxiosResponse>} - List of orders
//    */
//   getMaintenanceOrders: async (filters = {}) => {
//     try {
//       console.log('📋 Fetching maintenance orders...');
      
//       const response = await retryRequest(() =>
//         apiClient.get('/maintenance-orders', {
//           params: {
//             orderNumber: filters.orderNumber || undefined,
//             plant: filters.plant || undefined,
//             location: filters.location || undefined,
//             user: filters.user || undefined,
//             status: filters.status || undefined,
//             // Remove undefined values
//           }
//         })
//       );

//       console.log(`✅ Fetched ${response.data?.length || 0} orders`);
//       return response;

//     } catch (error) {
//       const message = getErrorMessage(error);
//       console.error('Error fetching orders:', message);
//       throw new Error(message);
//     }
//   },

//   /**
//    * Get activities for a specific order
//    * @param {string} orderNumber - Order number
//    * @returns {Promise<AxiosResponse>} - List of activities
//    */
//   getActivities: async (orderNumber) => {
//     try {
//       console.log('📋 Fetching activities for order:', orderNumber);

//       if (!orderNumber) {
//         throw new Error('Order number is required');
//       }

//       const response = await retryRequest(() =>
//         apiClient.get('/activities', {
//           params: { orderNumber }
//         })
//       );

//       console.log(`✅ Fetched ${response.data?.length || 0} activities`);
//       return response;

//     } catch (error) {
//       const message = getErrorMessage(error);
//       console.error('Error fetching activities:', message);
//       throw new Error(message);
//     }
//   },

//   /**
//    * Get approval history for equipment
//    * @param {string} equipment - Equipment ID
//    * @returns {Promise<AxiosResponse>} - Approval history records
//    */
//   getHistory: async (equipment) => {
//     try {
//       console.log('📜 Fetching approval history for equipment:', equipment);

//       if (!equipment) {
//         throw new Error('Equipment ID is required');
//       }

//       const response = await retryRequest(() =>
//         apiClient.get('/approval-history', {
//           params: { equipment }
//         })
//       );

//       console.log(`✅ Fetched ${response.data?.length || 0} history records`);
//       return response;

//     } catch (error) {
//       const message = getErrorMessage(error);
//       console.error('Error fetching history:', message);
//       throw new Error(message);
//     }
//   },

//   /**
//    * Approve orders
//    * @param {Array<string>} orderNumbers - Array of order numbers to approve
//    * @returns {Promise<AxiosResponse>} - Approval result
//    */
//   approveOrders: async (orderNumbers) => {
//     try {
//       if (!orderNumbers || orderNumbers.length === 0) {
//         throw new Error('At least one order must be selected');
//       }

//       console.log('✅ Approving orders:', orderNumbers);

//       const response = await retryRequest(() =>
//         apiClient.post('/orders/approve', {
//           orderNumbers: orderNumbers
//         })
//       );

//       console.log('✅ Orders approved successfully');
//       return response;

//     } catch (error) {
//       const message = getErrorMessage(error);
//       console.error('Error approving orders:', message);
//       throw new Error(message);
//     }
//   },

//   /**
//    * Reject orders
//    * @param {Array<string>} orderNumbers - Array of order numbers to reject
//    * @param {string} reason - Reason for rejection (optional)
//    * @returns {Promise<AxiosResponse>} - Rejection result
//    */
//   rejectOrders: async (orderNumbers, reason = '') => {
//     try {
//       if (!orderNumbers || orderNumbers.length === 0) {
//         throw new Error('At least one order must be selected');
//       }

//       console.log('❌ Rejecting orders:', orderNumbers);

//       const response = await retryRequest(() =>
//         apiClient.post('/orders/reject', {
//           orderNumbers: orderNumbers,
//           reason: reason
//         })
//       );

//       console.log('✅ Orders rejected successfully');
//       return response;

//     } catch (error) {
//       const message = getErrorMessage(error);
//       console.error('Error rejecting orders:', message);
//       throw new Error(message);
//     }
//   },

//   /**
//    * Check API health
//    * @returns {Promise<boolean>} - true if API is healthy
//    */
//   checkHealth: async () => {
//     try {
//       console.log('🏥 Checking API health...');
//       const response = await apiClient.get('/health');
//       console.log('✅ API is healthy');
//       return true;
//     } catch (error) {
//       console.error('❌ API health check failed:', error.message);
//       return false;
//     }
//   }
// };

// // ============================================================================
// // EXPORTS
// // ============================================================================

// export default moApprovalService;

// // ============================================================================
// // STARTUP DIAGNOSTICS
// // ============================================================================

// // Log API configuration on module load
// if (typeof window !== 'undefined') {
//   console.group('🔧 API Service Configuration');
//   console.log('Base URL:', API_BASE_URL);
//   console.log('Timeout:', `${REQUEST_TIMEOUT}ms`);
//   console.log('Retry Attempts:', RETRY_ATTEMPTS);
//   console.log('Retry Delay:', `${RETRY_DELAY}ms`);
//   console.log('Debug Mode:', DEBUG_MODE ? '🔍 ON' : 'OFF');
//   console.groupEnd();
// }













import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // withCredentials: false
});

/// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors (redirect to login)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export const moApprovalService = {
  getMaintenanceOrders: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.orderNumber) params.append('orderNumber', filters.orderNumber);
      if (filters.plant) params.append('plant', filters.plant);
      if (filters.location) params.append('location', filters.location);
       if (filters.user) params.append('user', filters.user); // ⭐ Make sure this is included
      if (filters.status) params.append('status', filters.status);

      
      const queryString = params.toString();
      const url = `/maintenance-orders${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Fetching orders from:', url);
      console.log('📋 Filters object:', filters); // ⭐ ADD THIS
      console.log('📤 Query string:', queryString); // ⭐ ADD THIS
      
      const response = await apiClient.get(url);
      
      console.log('✅ Orders fetched successfully:', response.data);
      
      return response.data;
    } catch (error) {
      // Provide user-friendly error messages
      if (error.message === 'Network Error') {
        throw new Error(
          'Cannot connect to backend. Please ensure backend is running on ' + 
          API_BASE_URL.replace('/api', '')
        );
      }
      
      if (error.response?.status === 500) {
        const details = error.response?.data?.details;
        let message = 'Server error occurred';
        
        if (details?.sapError) {
          message = `SAP Error: ${JSON.stringify(details.sapError)}`;
        } else if (details?.message) {
          message = details.message;
        }
        
        throw new Error(message);
      }
      
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to fetch maintenance orders'
      );
    }
  },

  getOrderDetails: async (orderNumber, objectNumber) => {
    try {
      const response = await apiClient.get(`/maintenance-orders/${orderNumber}/${objectNumber}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 
        error.message ||
        'Failed to fetch order details'
      );
    }
  },

  approveOrders: async (orderNumbers) => {
    try {
      if (!Array.isArray(orderNumbers) || orderNumbers.length === 0) {
        throw new Error('Invalid order numbers provided');
      }
      
      const response = await apiClient.post('/maintenance-orders/approve', {
        orders: orderNumbers
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 
        error.message ||
        'Failed to approve orders'
      );
    }
  },

  rejectOrders: async (orderNumbers, reason = '') => {
    try {
      if (!Array.isArray(orderNumbers) || orderNumbers.length === 0) {
        throw new Error('Invalid order numbers provided');
      }
      
      const response = await apiClient.post('/maintenance-orders/reject', {
        orders: orderNumbers,
        reason: reason
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 
        error.message ||
        'Failed to reject orders'
      );
    }
  },

  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      if (error.message === 'Network Error') {
        throw new Error('Backend service is not available');
      }
      throw new Error('Backend health check failed');
    }
  }
};

export default apiClient;
