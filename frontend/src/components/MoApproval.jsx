import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  useTheme,
  useMediaQuery,
  Fab,
  Badge,
  Slide,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import FilterBar from './FilterBar';
import ApprovalTable from './ApprovalTable';
import { moApprovalService } from '../services/odataService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const MoApproval = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Get userId from localStorage
  const currentUserId = localStorage.getItem('userId') || '';

  // ========== STATE MANAGEMENT ==========
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filters, setFilters] = useState({
    user: currentUserId
  });
  const [showFilters, setShowFilters] = useState(!isMobile);
  
  // New: Error dialog for detailed error info
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);

  // ========== LIFECYCLE EFFECTS ==========

  // Check API health on mount
  useEffect(() => {
    checkAPIHealth();
  }, []);

  // Initialize data on mount
  useEffect(() => {
    const initialFilters = {
      orderNumber: '',
      plant: '',
      location: '',
      user: currentUserId,
      status: ''
    };
    
    console.log('🚀 Initial load with filters:', initialFilters);
    fetchOrders(initialFilters);
  }, []); // Run only once on mount

  // Handle mobile responsiveness
  useEffect(() => {
    setShowFilters(!isMobile);
  }, [isMobile]);

  // ========== API FUNCTIONS ==========

  /**
   * Check if API is healthy
   */
  const checkAPIHealth = async () => {
    try {
      const isHealthy = await moApprovalService.checkHealth();
      if (!isHealthy) {
        console.warn('⚠️ API health check failed');
      }
    } catch (err) {
      console.warn('⚠️ Could not verify API health:', err.message);
    }
  };

  /**
   * Fetch orders with comprehensive error handling
   */
  const fetchOrders = async (searchFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      setErrorDetails(null);
      
      console.log('📡 Fetching orders with filters:', searchFilters);
      
      const response = await moApprovalService.getMaintenanceOrders(searchFilters);
      
      // Validate response
      if (!response.data) {
        throw new Error('No data returned from API');
      }

      // setOrders(response.data || []);
      setOrders(Array.isArray(response.data) ? response.data : []);

      setFilters(searchFilters);
      
      console.log(`✅ Successfully loaded ${response.data.length} orders`);

    } catch (err) {
      // Log detailed error
      const errorMessage = err.message || 'Failed to load orders';
      
      console.error('❌ Error fetching orders:', {
        message: errorMessage,
        details: err.debugDetails || err,
        timestamp: new Date().toISOString()
      });

      setError(errorMessage);
      setErrorDetails(err.debugDetails || {
        message: err.message,
        code: err.code,
        status: err.response?.status
      });

    } finally {
      setLoading(false);
    }
  };

  // ========== EVENT HANDLERS ==========

  const handleSearch = (searchFilters) => {
    console.log('🔍 Search triggered with filters:', searchFilters);
    setSelectedOrders([]);
    fetchOrders(searchFilters);
    if (isMobile) setShowFilters(false);
  };

  const handleSelectAll = (event) => {
    setSelectedOrders(
      event.target.checked ? orders.map(o => o.OrderNumber) : []
    );
  };

  const handleSelectOrder = (orderNumber) => {
    setSelectedOrders(prev =>
      prev.includes(orderNumber)
        ? prev.filter(n => n !== orderNumber)
        : [...prev, orderNumber]
    );
  };

  const handleOrderRowClick = (order) => {
    const fullOrder = orders.find(o => o.OrderNumber === order.OrderNumber);
    navigate('/mo-selected', { state: { order: fullOrder } });
  };

  const handleRefresh = () => {
    console.log('🔄 Refreshing with current filters:', filters);
    setSelectedOrders([]);
    fetchOrders(filters);
  };

  const handleRetryAfterError = () => {
    setError(null);
    setErrorDetails(null);
    handleRefresh();
  };

  const handleBack = () => {
    navigate(-1);
  };

  // ========== RENDER ==========

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: { xs: 2, sm: 3, md: 4 }
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Fade in timeout={800}>
          <Paper
            elevation={6}
            sx={{
              background: 'linear-gradient(135deg, #f0dc2f 0%, #4cecd7 100%)',
              p: { xs: 2, sm: 3 },
              mb: 2,
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'translate(50%, -50%)'
              }
            }}
          >
            <Box display="flex" height={25} justifyContent="space-between" alignItems="center" mb={2}>
                    <Button
                      startIcon={<ArrowBackIcon />}
                      onClick={handleBack}
                      sx={{
                         position: 'fixed',
                        backgroundColor: 'yellow',
                        color: 'blue',
                        fontWeight: 600,
                        height: 25,
                      }}
                    >
                    </Button>

<Box
  sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  }}
>
  <Typography
    variant={isMobile ? 'h5' : 'h3'}
    sx={{
      color: 'white',
      fontWeight: 700,
      textAlign: 'center',
      textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
      mb: 0.5,
    }}
  >
    MO Approval
  </Typography>
</Box>



              {!isMobile && (
                <Box
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    {orders.length}
                  </Typography>
                  
                  
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Total Orders
                  </Typography>


                </Box>
              )}
            </Box>
          </Paper>
        </Fade>

        {/* Filter Toggle Button (Mobile Only) */}
        {isMobile && (
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                background: 'linear-gradient(45deg, #ff70f3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                flex: 1
              }}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>

            <Badge badgeContent={orders.length} color="error" max={999}>
              <Box
                sx={{
                  backgroundColor: 'yellow',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  boxShadow: 4
                }}
              >
                <Typography variant="body2"  fontWeight={600} color="red">
                  Orders
                </Typography>
              </Box>
            </Badge>
          </Box>
        )}

        {/* Filter Bar */}
        <Slide direction="down" in={showFilters} mountOnEnter unmountOnExit>
          <Box>
            <FilterBar onSearch={handleSearch} loading={loading} />
          </Box>
        </Slide>

        {/* ERROR ALERT */}
        {error && (
          <Fade in={true}>
            <Paper
              elevation={4}
              sx={{
                p: 2,
                mb: 2,
                background: 'linear-gradient(135deg, #FFE0E0 0%, #eb9d9d 100%)',
                borderRadius: 2,
                borderLeft: '5px solid #F44336'
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={2}>
                <ErrorIcon sx={{ color: '#F44336', marginTop: '4px', flexShrink: 0 }} />
                <Box flex={1}>
                  <Typography variant="h6" sx={{ color: '#C62828', fontWeight: 700 }}>
                    Error Loading Orders
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#D32F2F', mt: 1 }}>
                    {error}
                  </Typography>
                  {errorDetails && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#C62828',
                        mt: 1,
                        display: 'block',
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                      onClick={() => setShowErrorDialog(true)}
                    >
                      📋 Click for details
                    </Typography>
                  )}
                </Box>
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleRetryAfterError}
                    sx={{
                      background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                      fontWeight: 600
                    }}
                  >
                    Retry
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setError(null)}
                    sx={{
                      borderColor: '#D32F2F',
                      color: '#D32F2F',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#C62828',
                        backgroundColor: 'rgba(244, 67, 54, 0.05)'
                      }
                    }}
                  >
                    Dismiss
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Fade>
        )}

        {/* LOADING INDICATOR */}
        {loading && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={8}
          >
            <Box textAlign="center">
              <CircularProgress size={60} thickness={4} />
              <Typography variant="body1" sx={{ mt: 2, color: 'white' }}>
                Loading orders...
              </Typography>
            </Box>
          </Box>
        )}

        {/* DATA TABLE */}
        {!loading && (
          <Fade in timeout={1200}>
            <Box>
              <ApprovalTable
                orders={orders}
                selectedOrders={selectedOrders}
                onSelectAll={handleSelectAll}
                onSelectOrder={handleSelectOrder}
                onRowClick={handleOrderRowClick}
              />
            </Box>
          </Fade>
        )}

        {/* FLOATING ACTION BUTTON */}
        {isMobile && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            }}
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshIcon />
          </Fab>
        )}

        {/* ERROR DETAILS DIALOG */}
        <Dialog
          open={showErrorDialog}
          onClose={() => setShowErrorDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, color: '#F44336' }}>
            📋 Error Details
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {errorDetails && (
              <Box
                sx={{
                  backgroundColor: '#f5f5f5',
                  p: 2,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  overflow: 'auto',
                  maxHeight: '300px'
                }}
              >
                <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(errorDetails, null, 2)}
                </Typography>
              </Box>
            )}
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              💡 <strong>Troubleshooting Tips:</strong>
            </Typography>
            <ul style={{ fontSize: '0.875rem', marginTop: '8px' }}>
              <li>Check if the backend API is running</li>
              <li>Verify the API base URL is correct in .env file</li>
              <li>Check Network tab in DevTools for the exact request URL</li>
              <li>Verify the endpoint path matches your backend</li>
              <li>Check browser console for more details</li>
            </ul>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowErrorDialog(false)} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* SUCCESS SNACKBAR */}
        <Snackbar
          open={!!success}
          autoHideDuration={3000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity="success"
            variant="filled"
            onClose={() => setSuccess(null)}
            sx={{ width: '100%', fontWeight: 600 }}
          >
            {success}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default MoApproval;









// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Container,
//   Box,
//   Typography,
//   Button,
//   CircularProgress,
//   Alert,
//   Snackbar,
//   Paper,
//   useTheme,
//   useMediaQuery,
//   Fab,
//   Badge,
//   Slide,
//   Fade
// } from '@mui/material';
// import RefreshIcon from '@mui/icons-material/Refresh';
// import FilterListIcon from '@mui/icons-material/FilterList';
// import FilterBar from './FilterBar';
// import ApprovalTable from './ApprovalTable';
// import { moApprovalService } from '../services/odataService';

// const MoApproval = () => {
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

//   // Get userId from localStorage
//   const currentUserId = localStorage.getItem('userId') || '';

//   const [orders, setOrders] = useState([]);
//   const [selectedOrders, setSelectedOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [filters, setFilters] = useState({
//     user: currentUserId
//   });
//   const [showFilters, setShowFilters] = useState(!isMobile);

//   // 🎯 Fetch orders on mount with user filter
//   useEffect(() => {
//     const initialFilters = {
//       orderNumber: '',
//       plant: '',
//       location: '',
//       user: currentUserId,
//       status: ''
//     };
    
//     console.log('🚀 Initial load with filters:', initialFilters);
//     fetchOrders(initialFilters);
//   }, []); // Run only once on mount

//   useEffect(() => {
//     setShowFilters(!isMobile);
//   }, [isMobile]);

//   const fetchOrders = async (searchFilters = {}) => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       console.log('📡 Fetching orders with filters:', searchFilters);
      
//       const response = await moApprovalService.getMaintenanceOrders(searchFilters);
//       setOrders(response.data || []);
//       setFilters(searchFilters);
//     } catch (err) {
//       setError(err.message);
//       console.error('❌ Error fetching orders:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (searchFilters) => {
//     console.log('🔍 Search triggered with filters:', searchFilters);
//     setSelectedOrders([]);
//     fetchOrders(searchFilters);
//     if (isMobile) setShowFilters(false);
//   };

//   const handleSelectAll = (event) => {
//     setSelectedOrders(
//       event.target.checked ? orders.map(o => o.OrderNumber) : []
//     );
//   };

//   const handleSelectOrder = (orderNumber) => {
//     setSelectedOrders(prev =>
//       prev.includes(orderNumber)
//         ? prev.filter(n => n !== orderNumber)
//         : [...prev, orderNumber]
//     );
//   };

//   // 🎯 Navigate to MoSelected with order data
//   const handleOrderRowClick = (order) => {
//     // Find the full order object
//     const fullOrder = orders.find(o => o.OrderNumber === order.OrderNumber);
//     navigate('/mo-selected', { state: { order: fullOrder } });
//   };

//   const handleRefresh = () => {
//     console.log('🔄 Refreshing with current filters:', filters);
//     setSelectedOrders([]);
//     fetchOrders(filters);
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: '100vh',
//         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//         py: { xs: 2, sm: 3, md: 4 }
//       }}
//     >
//       <Container maxWidth="xl">
//         {/* Header Section */}
//         <Fade in timeout={800}>
//           <Paper
//             elevation={6}
//             sx={{
//               background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
//               p: { xs: 2, sm: 3 },
//               mb: 3,
//               borderRadius: 3,
//               position: 'relative',
//               overflow: 'hidden',
//               '&::before': {
//                 content: '""',
//                 position: 'absolute',
//                 top: 0,
//                 right: 0,
//                 width: '200px',
//                 height: '200px',
//                 background: 'rgba(255, 255, 255, 0.1)',
//                 borderRadius: '50%',
//                 transform: 'translate(50%, -50%)'
//               }
//             }}
//           >
//             <Box display="flex" justifyContent="space-between" alignItems="center">
//               <Box>
//                 <Typography
//                   variant={isMobile ? 'h5' : 'h3'}
//                   sx={{
//                     color: 'white',
//                     fontWeight: 700,
//                     textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
//                     mb: 0.5
//                   }}
//                 >
//                   MO Approval
//                 </Typography>
//                 {!isMobile && (
//                   <Typography
//                     variant="subtitle1"
//                     sx={{
//                       color: 'rgba(255,255,255,0.9)',
//                       fontWeight: 400
//                     }}
//                   >
//                     Maintenance Order Approval Dashboard
//                   </Typography>
//                 )}
//               </Box>

//               {!isMobile && (
//                 <Box
//                   sx={{
//                     backgroundColor: 'rgba(255,255,255,0.2)',
//                     backdropFilter: 'blur(10px)',
//                     borderRadius: 2,
//                     p: 2,
//                     textAlign: 'center'
//                   }}
//                 >
//                   <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
//                     {orders.length}
//                   </Typography>
//                   <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
//                     Total Orders
//                   </Typography>
//                 </Box>
//               )}
//             </Box>

//             {/* Show current user filter */}
//             {currentUserId && (
//               <Box
//                 sx={{
//                   mt: 2,
//                   p: 1.5,
//                   backgroundColor: 'rgba(255,255,255,0.15)',
//                   borderRadius: 2,
//                   backdropFilter: 'blur(5px)'
//                 }}
//               >
//                 <Typography
//                   variant="body2"
//                   sx={{ color: 'white', fontWeight: 500 }}
//                 >
//                   👤 Logged in as: <strong>{currentUserId}</strong>
//                 </Typography>
//               </Box>
//             )}
//           </Paper>
//         </Fade>

//         {/* Filter Toggle Button (Mobile Only) */}
//         {isMobile && (
//           <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
//             <Button
//               variant="contained"
//               startIcon={<FilterListIcon />}
//               onClick={() => setShowFilters(!showFilters)}
//               sx={{
//                 background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
//                 boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
//               }}
//             >
//               {showFilters ? 'Hide Filters' : 'Show Filters'}
//             </Button>

//             <Badge badgeContent={orders.length} color="error" max={999}>
//               <Box
//                 sx={{
//                   backgroundColor: 'white',
//                   borderRadius: 2,
//                   px: 2,
//                   py: 1,
//                   boxShadow: 2
//                 }}
//               >
//                 <Typography variant="body2" fontWeight={600} color="primary">
//                   Orders
//                 </Typography>
//               </Box>
//             </Badge>
//           </Box>
//         )}

//         {/* Filter Bar */}
//         <Slide direction="down" in={showFilters} mountOnEnter unmountOnExit>
//           <Box>
//             <FilterBar onSearch={handleSearch} loading={loading} />
//           </Box>
//         </Slide>

//         {/* Loading Indicator */}
//         {loading && (
//           <Box
//             display="flex"
//             justifyContent="center"
//             alignItems="center"
//             py={8}
//           >
//             <Box textAlign="center">
//               <CircularProgress size={60} thickness={4} />
//               <Typography variant="body1" sx={{ mt: 2, color: 'white' }}>
//                 Loading orders...
//               </Typography>
//             </Box>
//           </Box>
//         )}

//         {/* Data Table */}
//         {!loading && (
//           <Fade in timeout={1200}>
//             <Box>
//               <ApprovalTable
//                 orders={orders}
//                 selectedOrders={selectedOrders}
//                 onSelectAll={handleSelectAll}
//                 onSelectOrder={handleSelectOrder}
//                 onRowClick={handleOrderRowClick}
//               />
//             </Box>
//           </Fade>
//         )}

//         {/* Floating Action Button (Mobile Only) */}
//         {isMobile && (
//           <Fab
//             color="primary"
//             sx={{
//               position: 'fixed',
//               bottom: 16,
//               right: 16,
//               background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
//             }}
//             onClick={handleRefresh}
//           >
//             <RefreshIcon />
//           </Fab>
//         )}

//         {/* Snackbars */}
//         <Snackbar
//           open={!!error}
//           autoHideDuration={5000}
//           onClose={() => setError(null)}
//           anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//         >
//           <Alert
//             severity="error"
//             variant="filled"
//             onClose={() => setError(null)}
//             sx={{ width: '100%', fontWeight: 600 }}
//           >
//             {error}
//           </Alert>
//         </Snackbar>

//         <Snackbar
//           open={!!success}
//           autoHideDuration={3000}
//           onClose={() => setSuccess(null)}
//           anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//         >
//           <Alert
//             severity="success"
//             variant="filled"
//             onClose={() => setSuccess(null)}
//             sx={{ width: '100%', fontWeight: 600 }}
//           >
//             {success}
//           </Alert>
//         </Snackbar>
//       </Container>
//     </Box>
//   );
// };

// export default MoApproval;
