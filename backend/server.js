import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sapClient from './utils/sapClient.js';
import authRoutes from './routes/authRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ===== ENHANCED CORS CONFIGURATION =====
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);



const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  const verification = authManager.verifyToken(token);
  
  if (!verification.valid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.user = verification.user;
  next();
};


// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Validate environment variables
const requiredEnvVars = [
  'SAP_BASE_URL',
  'SAP_USERNAME',
  'SAP_PASSWORD',
  'SAP_ODATA_SERVICE_PATH'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file in the backend folder.');
  console.error('');
  console.error('Required variables:');
  requiredEnvVars.forEach(varName => {
    console.error(`  - ${varName}: ${process.env[varName] ? '✓ Set' : '✗ Missing'}`);
  });
  console.error('');
}

// ===== API ENDPOINTS =====
// GET - Fetch Maintenance Orders

// // ===== API ENDPOINTS =====
// // GET - Fetch Maintenance Orders

app.get('/api/maintenance-orders', async (req, res) => {
  try {
    const { plant, location, user, orderNumber, status } = req.query;
    
    // Build filter query
    let filterParts = [];
    
    if (orderNumber) filterParts.push(`OrderNumber eq '${orderNumber}'`);
    if (plant) filterParts.push(`Plant eq '${plant}'`);
    if (location) filterParts.push(`FunctionalLocation eq '${location}'`);
    if (user) filterParts.push(`ApproverUsername eq '${user}'`);
    if (status) filterParts.push(`Status eq '${status}'`);
    
    const filterQuery = filterParts.length > 0 
      ? `?$format=json&$filter=${filterParts.join(' and ')}` 
      : '?$format=json';
    
    console.log(`🔍 Fetching orders with filter: ${filterQuery || 'No filters'}`);
    
    const response = await sapClient.get(
      `/MO_APPROVAL_HEADERSet${filterQuery}`
    );
    
    // Extract results from OData response
    const results = response.data.d?.results || [];
    
    console.log(`✓ Successfully fetched ${results.length} order(s)`);
    
    res.json({
      success: true,
      data: results,
      count: results.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching orders:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message,
      details: error.response?.data,
      statusCode: error.response?.status
    });
  }
});

// app.get('/api/maintenance-orders', async (req, res) => {
//   try {
//     console.log('Query Parameters:', req.query);
    
//     const { plant, location, user, orderNumber, status } = req.query;
    
//     // Build filter query
//     let filterParts = [];
    
//     if (orderNumber) filterParts.push(`OrderNumber eq '${orderNumber}'`);
//     if (plant) filterParts.push(`Plant eq '${plant}'`);
//     if (location) filterParts.push(`FunctionalLocation eq '${location}'`);
//     if (user) filterParts.push(`ApproverUsername eq '${user}'`);
//     if (status) filterParts.push(`Status eq '${status}'`);
    
//     const filterQuery = filterParts.length > 0 
//       ? `?$format=json&$filter=${filterParts.join(' and ')}` 
//       : '?$format=json';
    
//     console.log('🔍 Odata Filter Query:', filterQuery);
//     console.log('🌐 SAP URL:', `${process.env.SAP_BASE_URL}${process.env.SAP_ODATA_SERVICE_PATH}/MO_APPROVAL_HEADERSet${filterQuery}`);
    
//     const response = await sapClient.get(
//       `/MO_APPROVAL_HEADERSet${filterQuery}`
//     );
    
//     console.log('✅ SAP Response Status:', response.status);
//     console.log('📊 Response Type:', typeof response.data);
    
//     // Extract results from OData response
//     let results = [];
    
//     if (response.data && response.data.d) {
//       if (Array.isArray(response.data.d.results)) {
//         results = response.data.d.results;
//       } else if (response.data.d.results) {
//         console.warn('⚠️  Results is not an array:', typeof response.data.d.results);
//         results = [response.data.d.results];
//       } else {
//         console.warn('⚠️  No results field found in response');
//       }
//     } else {
//       console.warn('⚠️  Unexpected response structure:', Object.keys(response.data || {}));
//     }
    
//     console.log(`✓ Successfully fetched ${results.length} order(s)`);
//     console.log('═══════════════════════════════════════════════════');
//     console.log('');
    
//     res.json({
//       success: true,
//       data: results,
//       count: results.length,
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     console.error('');
//     console.error('═══════════════════════════════════════════════════');
//     console.error('❌ ERROR in GET /api/maintenance-orders');
//     console.error('Error Type:', error.name);
//     console.error('Error Message:', error.message);
    
//     if (error.response) {
//       console.error('SAP Response Status:', error.response.status);
//       console.error('SAP Response Status Text:', error.response.statusText);
//       console.error('SAP Response Data:', JSON.stringify(error.response.data, null, 2));
//     } else if (error.request) {
//       console.error('No response received from SAP');
//       console.error('Request Details:', {
//         method: error.config?.method,
//         url: error.config?.url,
//         baseURL: error.config?.baseURL
//       });
//     } else {
//       console.error('Error setting up request:', error.message);
//     }
    
//     console.error('Stack Trace:', error.stack);
//     console.error('═══════════════════════════════════════════════════');
//     console.error('');
    
//     // Send detailed error to frontend
//     res.status(error.response?.status || 500).json({
//       success: false,
//       error: error.message,
//       details: {
//         sapStatus: error.response?.status,
//         sapStatusText: error.response?.statusText,
//         sapError: error.response?.data,
//         message: error.message,
//         type: error.name
//       },
//       statusCode: error.response?.status,
//       timestamp: new Date().toISOString()
//     });
//   }
// });

// GET - Single Order Details
app.get('/api/maintenance-orders/:orderNumber/:objectNumber', async (req, res) => {
  try {
    const { orderNumber, objectNumber } = req.params;
    
    console.log(`🔍 Fetching order details: ${orderNumber} - ${objectNumber}`);
    
    const response = await sapClient.get(
      `/MO_APPROVAL_HEADERSet(OrderNumber='${orderNumber}',ObjectNumber='${objectNumber}')?$format=json`
    );
    
    console.log(`✓ Order details fetched successfully`);
    
    res.json({
      success: true,
      data: response.data.d,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching order details:', error.message);
    
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message,
      details: error.response?.data
    });
  }
});

// POST - Approve Orders
app.post('/api/maintenance-orders/approve', async (req, res) => {
  try {
    const { orders } = req.body;
    
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: orders array is required'
      });
    }
    
    console.log(`✏️ Approving ${orders.length} order(s):`, orders);
    
    res.json({
      success: true,
      message: `Successfully approved ${orders.length} order(s)`,
      approvedOrders: orders,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Approval Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET - Health Check with Detailed Diagnostics
app.get('/api/health', async (req, res) => {
  const diagnostics = {
    status: 'OK',
    service: 'MO Approval Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    configuration: {
      sapBaseUrl: process.env.SAP_BASE_URL || '❌ Not configured',
      sapServicePath: process.env.SAP_ODATA_SERVICE_PATH || '❌ Not configured',
      sapUsername: process.env.SAP_USERNAME ? '✓ Configured' : '❌ Not configured',
      sapPassword: process.env.SAP_PASSWORD ? '✓ Configured' : '❌ Not configured',
      sapClient: process.env.SAP_CLIENT || '100 (default)'
    },
    csrf: {
      enabled: true
    }
  };

  // Try to get CSRF token info
  try {
    const tokenInfo = sapClient.getTokenInfo();
    diagnostics.csrf = {
      ...diagnostics.csrf,
      tokenValid: tokenInfo.isValid,
      expiresIn: `${Math.floor(tokenInfo.expiresIn / 1000 / 60)} minutes`
    };
  } catch (error) {
    diagnostics.csrf.error = error.message;
  }

  res.json(diagnostics);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MO Approval Backend API',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'GET /api/maintenance-orders',
      'GET /api/maintenance-orders/:orderNumber/:objectNumber',
      'POST /api/maintenance-orders/approve'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║    MO APPROVAL BACKEND - CSRF TOKEN ENABLED        ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server:        http://localhost:${PORT}`);
  console.log(`📡 SAP System:    ${process.env.SAP_BASE_URL || '❌ NOT CONFIGURED'}`);
  console.log(`📋 OData Service: ${process.env.SAP_ODATA_SERVICE_PATH || '❌ NOT CONFIGURED'}`);
  console.log(`👤 SAP Username:  ${process.env.SAP_USERNAME ? '✓ Configured' : '❌ NOT CONFIGURED'}`);
  console.log(`🔐 SAP Password:  ${process.env.SAP_PASSWORD ? '✓ Configured' : '❌ NOT CONFIGURED'}`);
  console.log(`🔒 CSRF Token:    Enabled`);
  console.log(`🔗 Health Check:  http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment:   ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('════════════════════════════════════════════════════');
  console.log('Available Endpoints:');
  console.log(`  GET    /api/health`);
  console.log(`  GET    /api/maintenance-orders`);
  console.log(`  POST   /api/maintenance-orders/approve`);
  console.log('════════════════════════════════════════════════════');
  console.log('');
  
  if (missingEnvVars.length > 0) {
    console.warn('⚠️  WARNING: Missing environment variables!');
    console.warn('   Please configure the following in your .env file:');
    missingEnvVars.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
    console.warn('');
  }
  
  console.log('Press Ctrl+C to stop\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});







// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import sapClient from './utils/sapClient.js';

// // Load environment variables
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3001;

// // ===== ENHANCED CORS CONFIGURATION =====
// const corsOptions = {
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps or Postman)
//     if (!origin) return callback(null, true);
    
//     const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
//       'http://localhost:3000',
//       'http://localhost:5173',
//       'http://localhost:5174',
//       'http://127.0.0.1:3000',
//       'http://127.0.0.1:5173'
//     ];
    
//     if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
//       callback(null, true);
//     } else {
//       console.warn(`⚠️  CORS blocked origin: ${origin}`);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
//   exposedHeaders: ['Content-Range', 'X-Content-Range'],
//   maxAge: 86400 // 24 hours
// };

// app.use(cors(corsOptions));

// // Handle preflight requests
// app.options('*', cors(corsOptions));

// // ===== MIDDLEWARE =====
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Request logging middleware
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//   next();
// });

// // Validate required environment variables
// const requiredEnvVars = [
//   'SAP_BASE_URL',
//   'SAP_USERNAME',
//   'SAP_PASSWORD',
//   'SAP_ODATA_SERVICE_PATH'
// ];
// const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

// if (missingEnvVars.length > 0) {
//   console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
//   console.error('Please create a .env file in the backend folder with all required variables.');
//   process.exit(1);
// }

// // ===== API ENDPOINTS =====
// // GET - Fetch Maintenance Orders

// app.get('/api/maintenance-orders', async (req, res) => {
//   try {
//     const { plant, location, user, orderNumber, status } = req.query;
    
//     // Build filter query
//     let filterParts = [];
    
//     if (orderNumber) filterParts.push(`OrderNumber eq '${orderNumber}'`);
//     if (plant) filterParts.push(`Plant eq '${plant}'`);
//     if (location) filterParts.push(`FunctionalLocation eq '${location}'`);
//     if (user) filterParts.push(`ApproverUsername eq '${user}'`);
//     if (status) filterParts.push(`Status eq '${status}'`);
    
//     const filterQuery = filterParts.length > 0 
//       ? `?$format=json&$filter=${filterParts.join(' and ')}` 
//       : '?$format=json';
    
//     console.log(`🔍 Fetching orders with filter: ${filterQuery || 'No filters'}`);
    
//     const response = await sapClient.get(
//       `/MO_APPROVAL_HEADERSet${filterQuery}`
//     );
    
//     // Extract results from OData response
//     const results = response.data.d?.results || [];
    
//     console.log(`✓ Successfully fetched ${results.length} order(s)`);
    
//     res.json({
//       success: true,
//       data: results,
//       count: results.length,
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching orders:', {
//       message: error.message,
//       status: error.response?.status,
//       statusText: error.response?.statusText
//     });
    
//     res.status(error.response?.status || 500).json({
//       success: false,
//       error: error.message,
//       details: error.response?.data,
//       statusCode: error.response?.status
//     });
//   }
// });

// // GET - Single Order Details
// app.get('/api/maintenance-orders/:orderNumber/:objectNumber', async (req, res) => {
//   try {
//     const { orderNumber, objectNumber } = req.params;
    
//     console.log(`🔍 Fetching order details: ${orderNumber} - ${objectNumber}`);
    
//     const response = await sapClient.get(
//       `/MO_APPROVAL_HEADERSet(OrderNumber='${orderNumber}',ObjectNumber='${objectNumber}')?$format=json`
//     );
    
//     console.log(`✓ Order details fetched successfully`);
    
//     res.json({
//       success: true,
//       data: response.data.d,
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching order details:', error.message);
    
//     res.status(error.response?.status || 500).json({
//       success: false,
//       error: error.message,
//       details: error.response?.data
//     });
//   }
// });

// // GET - Fetch Order Status (Navigation property)
// app.get('/api/maintenance-orders/:orderNumber/:objectNumber/status', async (req, res) => {
//   try {
//     const { orderNumber, objectNumber } = req.params;
    
//     console.log(`🔍 Fetching order status: ${orderNumber}`);
    
//     const response = await sapClient.get(
//       `/MO_APPROVAL_HEADERSet(OrderNumber='${orderNumber}',ObjectNumber='${objectNumber}')/MO_ORDER_STATUSSet?$format=json`
//     );
    
//     const results = response.data.d?.results || [];
    
//     console.log(`✓ Status history fetched: ${results.length} record(s)`);
    
//     res.json({
//       success: true,
//       data: results,
//       count: results.length
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching order status:', error.message);
    
//     res.status(error.response?.status || 500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // POST - Approve Orders (Uses CSRF Token)
// app.post('/api/maintenance-orders/approve', async (req, res) => {
//   try {
//     const { orders } = req.body;
    
//     if (!orders || !Array.isArray(orders) || orders.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid request: orders array is required'
//       });
//     }
    
//     console.log(`✏️ Approving ${orders.length} order(s):`, orders);
    
//     // TODO: Implement actual SAP approval logic
    
//     res.json({
//       success: true,
//       message: `Successfully approved ${orders.length} order(s)`,
//       approvedOrders: orders,
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     console.error('❌ Approval Error:', error.message);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // POST - Reject Orders (Uses CSRF Token)
// app.post('/api/maintenance-orders/reject', async (req, res) => {
//   try {
//     const { orders, reason } = req.body;
    
//     if (!orders || !Array.isArray(orders) || orders.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid request: orders array is required'
//       });
//     }
    
//     console.log(`❌ Rejecting ${orders.length} order(s):`, orders);
//     console.log(`Reason: ${reason || 'No reason provided'}`);
    
//     res.json({
//       success: true,
//       message: `Successfully rejected ${orders.length} order(s)`,
//       rejectedOrders: orders,
//       reason: reason,
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     console.error('❌ Rejection Error:', error.message);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // GET - CSRF Token Info (for debugging)
// app.get('/api/csrf-info', (req, res) => {
//   const tokenInfo = sapClient.getTokenInfo();
//   res.json({
//     success: true,
//     csrfToken: tokenInfo,
//     timestamp: new Date().toISOString()
//   });
// });

// // POST - Force CSRF Token Refresh
// app.post('/api/csrf-refresh', async (req, res) => {
//   try {
//     console.log('🔄 Manually refreshing CSRF token...');
//     const { token, cookies } = await sapClient.refreshToken();
    
//     res.json({
//       success: true,
//       message: 'CSRF token refreshed successfully',
//       token: token?.substring(0, 20) + '...',
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Health check
// app.get('/api/health', (req, res) => {
//   const tokenInfo = sapClient.getTokenInfo();
  
//   res.json({ 
//     status: 'OK',
//     service: 'MO Approval Backend API',
//     version: '1.0.0',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV,
//     sapSystem: process.env.SAP_BASE_URL,
//     sapService: process.env.SAP_ODATA_SERVICE_PATH,
//     csrf: {
//       enabled: true,
//       tokenValid: tokenInfo.isValid,
//       expiresIn: `${Math.floor(tokenInfo.expiresIn / 1000 / 60)} minutes`
//     }
//   });
// });

// // Root endpoint
// app.get('/', (req, res) => {
//   res.json({
//     message: 'MO Approval Backend API with CSRF Token Support',
//     version: '1.0.0',
//     endpoints: [
//       'GET /api/health',
//       'GET /api/maintenance-orders',
//       'GET /api/maintenance-orders/:orderNumber/:objectNumber',
//       'POST /api/maintenance-orders/approve',
//       'POST /api/maintenance-orders/reject'
//     ]
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     error: 'Endpoint not found',
//     path: req.path,
//     method: req.method
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('💥 Server Error:', err);
//   res.status(500).json({
//     success: false,
//     error: 'Internal Server Error',
//     message: err.message
//   });
// });

// // Start server
// const server = app.listen(PORT, () => {
//   console.log('');
//   console.log('╔════════════════════════════════════════════════════╗');
//   console.log('║    MO APPROVAL BACKEND - CSRF TOKEN ENABLED        ║');
//   console.log('╚════════════════════════════════════════════════════╝');
//   console.log('');
//   console.log(`🚀 Server:        http://localhost:${PORT}`);
//   console.log(`📡 SAP System:    ${process.env.SAP_BASE_URL}`);
//   console.log(`📋 OData Service: ${process.env.SAP_ODATA_SERVICE_PATH}`);
//   console.log(`🔒 CSRF Token:    Enabled`);
//   console.log(`🔗 Health Check:  http://localhost:${PORT}/api/health`);
//   console.log(`🔑 CSRF Info:     http://localhost:${PORT}/api/csrf-info`);
//   console.log(`🌍 Environment:   ${process.env.NODE_ENV}`);
//   console.log('');
//   console.log('════════════════════════════════════════════════════');
//   console.log('Available Endpoints:');
//   console.log(`  GET    /api/maintenance-orders`);
//   console.log(`  GET    /api/maintenance-orders/:id/:objnr`);
//   console.log(`  POST   /api/maintenance-orders/approve`);
//   console.log(`  POST   /api/maintenance-orders/reject`);
//   console.log(`  GET    /api/csrf-info`);
//   console.log(`  POST   /api/csrf-refresh`);
//   console.log('════════════════════════════════════════════════════');
//   console.log('Press Ctrl+C to stop\n');
// });

// // Graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('SIGTERM signal received: closing HTTP server');
//   server.close(() => {
//     console.log('HTTP server closed');
//     process.exit(0);
//   });
// });

// process.on('SIGINT', () => {
//   console.log('\n👋 Shutting down gracefully...');
//   server.close(() => {
//     console.log('HTTP server closed');
//     process.exit(0);
//   });
// });





// import express from 'express';
// import axios from 'axios';
// import cors from 'cors';
// import https from 'https';
// import dotenv from 'dotenv';

// // Load environment variables
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3001;

// // Middleware
// // app.use(cors({
// //   origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
// //   credentials: true
// // }));


// app.use(cors({
//   origin: 'https://mo-approval.vercel.app',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true
// }));


// app.use(express.json());

// // SAP OData Configuration from environment variables
// const SAP_CONFIG = {
//   baseURL: process.env.SAP_BASE_URL,
//   auth: {
//     username: process.env.SAP_USERNAME,
//     password: process.env.SAP_PASSWORD
//   },
//   headers: {
//     'Accept': 'application/json',
//     'Content-Type': 'application/json',
//     'sap-client': process.env.SAP_CLIENT || '100'
//   },
//   httpsAgent: new https.Agent({
//     rejectUnauthorized: process.env.SSL_REJECT_UNAUTHORIZED === 'true'
//   }),
//   timeout: 30000
// };

// // Validate required environment variables
// const requiredEnvVars = ['SAP_BASE_URL', 'SAP_USERNAME', 'SAP_PASSWORD', 'SAP_ODATA_SERVICE_PATH'];
// const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

// if (missingEnvVars.length > 0) {
//   console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
//   console.error('Please create a .env file in the backend folder with all required variables.');
//   process.exit(1);
// }

// // Create axios instance
// const sapClient = axios.create(SAP_CONFIG);

// // Request interceptor for logging
// sapClient.interceptors.request.use(
//   (config) => {
//     if (process.env.LOG_LEVEL === 'debug') {
//       console.log(`📤 Request: ${config.method.toUpperCase()} ${config.url}`);
//     }
//     return config;
//   },
//   (error) => {
//     console.error('❌ Request Error:', error.message);
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for logging
// sapClient.interceptors.response.use(
//   (response) => {
//     if (process.env.LOG_LEVEL === 'debug') {
//       console.log(`✅ Response: ${response.config.url} - Status: ${response.status}`);
//     }
//     return response;
//   },
//   (error) => {
//     console.error('❌ Response Error:', error.response?.status, error.message);
//     return Promise.reject(error);
//   }
// );

// // GET - Fetch Maintenance Orders
// app.get('/api/maintenance-orders', async (req, res) => {
//   try {
//     const { plant, location, user, orderNumber, status } = req.query;
    
//     // Build filter query
//     let filterParts = [];
    
//     if (orderNumber) filterParts.push(`OrderNumber eq '${orderNumber}'`);
//     if (plant) filterParts.push(`Plant eq '${plant}'`);
//     if (location) filterParts.push(`FunctionalLocation eq '${location}'`);
//     if (user) filterParts.push(`ApproverUsername eq '${user}'`);
//     if (status) filterParts.push(`Status eq '${status}'`);
    
//     const filterQuery = filterParts.length > 0 
//       ? `?$filter=${filterParts.join(' and ')}` 
//       : '';
    
//     console.log(`🔍 Fetching orders with filter: ${filterQuery || 'No filters'}`);
    
//     const url = `${process.env.SAP_ODATA_SERVICE_PATH}/MO_APPROVAL_HEADERSet${filterQuery}`;
    
//     const response = await sapClient.get(url, {
//       headers: {
//         'Accept': 'application/json'
//       }
//     });
    
//     // Extract results from OData response
//     const results = response.data.d?.results || [];
    
//     console.log(`✓ Successfully fetched ${results.length} order(s)`);
    
//     res.json({
//       success: true,
//       data: results,
//       count: results.length,
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     console.error('❌ SAP OData Error:', {
//       message: error.message,
//       status: error.response?.status,
//       statusText: error.response?.statusText,
//       data: error.response?.data
//     });
    
//     res.status(error.response?.status || 500).json({
//       success: false,
//       error: error.message,
//       details: error.response?.data,
//       statusCode: error.response?.status
//     });
//   }
// });

// // GET - Single Order Details
// app.get('/api/maintenance-orders/:orderNumber/:objectNumber', async (req, res) => {
//   try {
//     const { orderNumber, objectNumber } = req.params;
    
//     console.log(`🔍 Fetching order details: ${orderNumber} - ${objectNumber}`);
    
//     const url = `${process.env.SAP_ODATA_SERVICE_PATH}/MO_APPROVAL_HEADERSet(OrderNumber='${orderNumber}',ObjectNumber='${objectNumber}')`;
    
//     const response = await sapClient.get(url, {
//       headers: {
//         'Accept': 'application/json'
//       }
//     });
    
//     console.log(`✓ Order details fetched successfully`);
    
//     res.json({
//       success: true,
//       data: response.data.d,
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     console.error('❌ SAP OData Error:', {
//       message: error.message,
//       status: error.response?.status
//     });
    
//     res.status(error.response?.status || 500).json({
//       success: false,
//       error: error.message,
//       details: error.response?.data
//     });
//   }
// });

// // GET - Fetch Order Status (Navigation property)
// app.get('/api/maintenance-orders/:orderNumber/:objectNumber/status', async (req, res) => {
//   try {
//     const { orderNumber, objectNumber } = req.params;
    
//     console.log(`🔍 Fetching order status: ${orderNumber}`);
    
//     const url = `${process.env.SAP_ODATA_SERVICE_PATH}/MO_APPROVAL_HEADERSet(OrderNumber='${orderNumber}',ObjectNumber='${objectNumber}')/MO_ORDER_STATUSSet`;
    
//     const response = await sapClient.get(url, {
//       headers: {
//         'Accept': 'application/json'
//       }
//     });
    
//     const results = response.data.d?.results || [];
    
//     console.log(`✓ Status history fetched: ${results.length} record(s)`);
    
//     res.json({
//       success: true,
//       data: results,
//       count: results.length
//     });
    
//   } catch (error) {
//     console.error('❌ SAP OData Error:', error.message);
    
//     res.status(error.response?.status || 500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // POST - Approve Orders
// app.post('/api/maintenance-orders/approve', async (req, res) => {
//   try {
//     const { orders } = req.body;
    
//     if (!orders || !Array.isArray(orders) || orders.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid request: orders array is required'
//       });
//     }
    
//     console.log(`✏️ Approving ${orders.length} order(s):`, orders);
    
//     // TODO: Implement actual approval logic
//     // This would typically:
//     // 1. Call SAP Function Module (e.g., BAPI_ALM_ORDER_MAINTAIN)
//     // 2. Or update status via OData PATCH/POST
//     // 3. Or call custom Z function module
    
//     // For now, simulate successful approval
//     res.json({
//       success: true,
//       message: `Successfully approved ${orders.length} order(s)`,
//       approvedOrders: orders,
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     console.error('❌ Approval Error:', error.message);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // POST - Reject Orders
// app.post('/api/maintenance-orders/reject', async (req, res) => {
//   try {
//     const { orders, reason } = req.body;
    
//     if (!orders || !Array.isArray(orders) || orders.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid request: orders array is required'
//       });
//     }
    
//     console.log(`❌ Rejecting ${orders.length} order(s):`, orders);
//     console.log(`Reason: ${reason || 'No reason provided'}`);
    
//     // TODO: Implement actual rejection logic
    
//     res.json({
//       success: true,
//       message: `Successfully rejected ${orders.length} order(s)`,
//       rejectedOrders: orders,
//       reason: reason,
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     console.error('❌ Rejection Error:', error.message);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ 
//     status: 'OK',
//     service: 'MO Approval Backend API',
//     version: '1.0.0',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV,
//     sapSystem: process.env.SAP_BASE_URL,
//     sapService: process.env.SAP_ODATA_SERVICE_PATH
//   });
// });

// // Root endpoint - API documentation
// app.get('/', (req, res) => {
//   res.json({
//     message: 'MO Approval Backend API',
//     version: '1.0.0',
//     documentation: {
//       endpoints: {
//         health: 'GET /api/health',
//         orders: 'GET /api/maintenance-orders',
//         orderDetails: 'GET /api/maintenance-orders/:orderNumber/:objectNumber',
//         orderStatus: 'GET /api/maintenance-orders/:orderNumber/:objectNumber/status',
//         approve: 'POST /api/maintenance-orders/approve',
//         reject: 'POST /api/maintenance-orders/reject'
//       },
//       queryParameters: {
//         orders: {
//           plant: 'Filter by plant code (e.g., 3117)',
//           location: 'Filter by functional location',
//           user: 'Filter by approver username',
//           orderNumber: 'Filter by order number',
//           status: 'Filter by status code'
//         }
//       }
//     }
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     error: 'Endpoint not found',
//     path: req.path
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('💥 Server Error:', err);
//   res.status(500).json({
//     success: false,
//     error: 'Internal Server Error',
//     message: err.message
//   });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log('');
//   console.log('╔════════════════════════════════════════════════════╗');
//   console.log('║       MO APPROVAL BACKEND SERVER                   ║');
//   console.log('╚════════════════════════════════════════════════════╝');
//   console.log('');
//   console.log(`🚀 Server:        http://localhost:${PORT}`);
//   console.log(`📡 SAP System:    ${process.env.SAP_BASE_URL}`);
//   console.log(`📋 OData Service: ${process.env.SAP_ODATA_SERVICE_PATH}`);
//   console.log(`🔗 Health Check:  http://localhost:${PORT}/api/health`);
//   console.log(`📖 API Docs:      http://localhost:${PORT}/`);
//   console.log(`🌍 Environment:   ${process.env.NODE_ENV}`);
//   console.log('');
//   console.log('════════════════════════════════════════════════════');
//   console.log('Available Endpoints:');
//   console.log(`  GET    /api/maintenance-orders`);
//   console.log(`  GET    /api/maintenance-orders/:id/:objnr`);
//   console.log(`  POST   /api/maintenance-orders/approve`);
//   console.log(`  POST   /api/maintenance-orders/reject`);
//   console.log('════════════════════════════════════════════════════');
//   console.log('Press Ctrl+C to stop\n');
// });

// // Graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('SIGTERM signal received: closing HTTP server');
//   process.exit(0);
// });

// process.on('SIGINT', () => {
//   console.log('\n👋 Shutting down gracefully...');
//   process.exit(0);
// });