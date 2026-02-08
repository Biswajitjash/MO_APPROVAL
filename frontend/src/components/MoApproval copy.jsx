import React, { useState, useEffect } from 'react';
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
  Fade
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterBar from './FilterBar';
import ApprovalTable from './ApprovalTable';
import { moApprovalService } from '../services/odataService';

const MoApproval = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Get userId from localStorage
  const currentUserId = localStorage.getItem('userId') || '';

  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filters, setFilters] = useState({
    user: currentUserId // ⭐ Initialize with current user
  });
  const [showFilters, setShowFilters] = useState(!isMobile);

  // ⭐ Fetch orders on mount with user filter
  useEffect(() => {
    const initialFilters = {
      orderNumber: '',
      plant: '',
      location: '',
      user: currentUserId, // Apply user filter by default
      status: ''
    };
    
    console.log('🚀 Initial load with filters:', initialFilters);
    fetchOrders(initialFilters);
  }, []); // Run only once on mount

  useEffect(() => {
    setShowFilters(!isMobile);
  }, [isMobile]);

  const fetchOrders = async (searchFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Fetching orders with filters:', searchFilters);
      
      const response = await moApprovalService.getMaintenanceOrders(searchFilters);
      setOrders(response.data || []);
      setFilters(searchFilters);
    } catch (err) {
      setError(err.message);
      console.error('❌ Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleApprove = async () => {
    if (!selectedOrders.length) {
      setError('Select at least one order to approve');
      return;
    }

    try {
      setLoading(true);
      await moApprovalService.approveOrders(selectedOrders);
      setSuccess(`✓ Approved ${selectedOrders.length} order(s) successfully`);
      setSelectedOrders([]);
      
      // Refresh with current filters
      fetchOrders(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    if (!selectedOrders.length) {
      setError('Select at least one order to reject');
      return;
    }
    setError('Reject functionality will be available soon');
  };

  const handleRefresh = () => {
    console.log('🔄 Refreshing with current filters:', filters);
    setSelectedOrders([]);
    fetchOrders(filters);
  };

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
              background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
              p: { xs: 2, sm: 3 },
              mb: 3,
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
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography
                  variant={isMobile ? 'h5' : 'h3'}
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                    mb: 0.5
                  }}
                >
                  MO Approval
                </Typography>
                {!isMobile && (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 400
                    }}
                  >
                    Maintenance Order Approval Dashboard
                  </Typography>
                )}
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

            {/* Show current user filter */}
            {currentUserId && (
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: 2,
                  backdropFilter: 'blur(5px)'
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: 'white', fontWeight: 500 }}
                >
                  👤 Logged in as: <strong>{currentUserId}</strong>
                </Typography>
              </Box>
            )}
          </Paper>
        </Fade>

        {/* Filter Toggle Button (Mobile Only) */}
        {isMobile && (
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="contained"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              }}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>

            <Badge badgeContent={orders.length} color="error" max={999}>
              <Box
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  boxShadow: 2
                }}
              >
                <Typography variant="body2" fontWeight={600} color="primary">
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

        {/* Action Bar */}
        <Fade in timeout={1000}>
          <Paper
            elevation={4}
            sx={{
              p: 2,
              mb: 2,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: 2,
              position: isMobile ? 'sticky' : 'static',
              bottom: isMobile ? 70 : 'auto',
              top: isMobile ? 'auto' : 0,
              zIndex: 100,
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2,
              alignItems: 'center'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                width: isMobile ? '100%' : 'auto',
                flexWrap: 'wrap'
              }}
            >
              <Button
                fullWidth={isMobile}
                variant="contained"
                size={isMobile ? 'large' : 'medium'}
                startIcon={<CheckCircleIcon />}
                onClick={handleApprove}
                disabled={loading || !selectedOrders.length}
                sx={{
                  background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                  boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
                  fontWeight: 600,
                  flex: isMobile ? 1 : 'auto'
                }}
              >
                Approve ({selectedOrders.length})
              </Button>

              <Button
                fullWidth={isMobile}
                variant="contained"
                size={isMobile ? 'large' : 'medium'}
                startIcon={<CancelIcon />}
                onClick={handleReject}
                disabled={loading || !selectedOrders.length}
                sx={{
                  background: 'linear-gradient(45deg, #F44336 30%, #E91E63 90%)',
                  boxShadow: '0 3px 5px 2px rgba(244, 67, 54, .3)',
                  fontWeight: 600,
                  flex: isMobile ? 1 : 'auto'
                }}
              >
                Reject ({selectedOrders.length})
              </Button>

              {!isMobile && (
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={loading}
                  sx={{ fontWeight: 600 }}
                >
                  Refresh
                </Button>
              )}
            </Box>

            {!isMobile && (
              <Box sx={{ ml: 'auto', display: 'flex', gap: 3 }}>
                <Box
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    boxShadow: 1
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Selected
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    {selectedOrders.length}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    boxShadow: 1
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="secondary">
                    {orders.length}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Fade>

        {/* Loading Indicator */}
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

        {/* Data Table */}
        {!loading && (
          <Fade in timeout={1200}>
            <Box>
              <ApprovalTable
                orders={orders}
                selectedOrders={selectedOrders}
                onSelectAll={handleSelectAll}
                onSelectOrder={handleSelectOrder}
              />
            </Box>
          </Fade>
        )}

        {/* Floating Action Button (Mobile Only) */}
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
          >
            <RefreshIcon />
          </Fab>
        )}

        {/* Snackbars */}
        <Snackbar
          open={!!error}
          autoHideDuration={5000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity="error"
            variant="filled"
            onClose={() => setError(null)}
            sx={{ width: '100%', fontWeight: 600 }}
          >
            {error}
          </Alert>
        </Snackbar>

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

