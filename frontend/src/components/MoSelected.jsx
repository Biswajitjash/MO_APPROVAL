import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fade,
  Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryIcon from '@mui/icons-material/History';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EquipmentIcon from '@mui/icons-material/Settings';
import { formatCurrency, getStatusColor } from '../utils/formatters';

// Sample Activity Data - Replace with API call later
const SAMPLE_ACTIVITIES = [
  {
    Activity: '0010',
    Description: 'Tyre Replacement Work',
    Material: '41000071',
    Quantity: 1.0,
    Unit: 'NOS',
    Rate: 80446.50,
    Amount: 80446.00,
    ManPower: 2,
    Duration: 0.5,
    TotalTime: 1.0,
    MvType: 261
  },
  {
    Activity: '0011',
    Description: 'Tyre 23.5X25',
    Material: '41000071',
    Quantity: 2.0,
    Unit: 'NOS',
    Rate: 500.50,
    Amount: 1001.00,
    ManPower: 1,
    Duration: 0.25,
    TotalTime: 0.5,
    MvType: 261
  },
  {
    Activity: '0020',
    Description: 'O Ring 26.5.25',
    Material: '17000641',
    Quantity: 1.0,
    Unit: 'NOS',
    Rate: 596.00,
    Amount: 596.00,
    ManPower: 0,
    Duration: 0.2,
    TotalTime: 0.3,
    MvType: 261
  }
];

// Sample Historical Data
const SAMPLE_HISTORY = [
  {
    Equipment: 'EQ001',
    Approver: 'Kalyan MD. SAMSUZAMMA',
    Role: 'In-Charge',
    RequestedDate: '06-02-2026',
    ApprovedDate: '06-02-2026',
    ApprovedTime: '22:04',
    Status: 'Approved',
    TotalHrs: 0,
    DayType: 261
  },
  {
    Equipment: 'EQ001',
    Approver: 'Vinod Kumar Singh',
    Role: 'Manager',
    RequestedDate: '06-02-2026',
    ApprovedDate: '-',
    ApprovedTime: '-',
    Status: 'Awaiting',
    TotalHrs: 11,
    DayType: 261
  },
  {
    Equipment: 'EQ001',
    Approver: 'Rajesh Sharma',
    Role: 'Co-Ordinator',
    RequestedDate: '05-02-2026',
    ApprovedDate: '05-02-2026',
    ApprovedTime: '15:30',
    Status: 'Approved',
    TotalHrs: 5,
    DayType: 261
  }
];

const MoSelected = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [order, setOrder] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Get order from navigation state
  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order);
    } else {
      setError('No order data found. Please select an order.');
      setTimeout(() => navigate('/mo-approval'), 2000);
    }
  }, [location, navigate]);

  const handleActivitySelect = (activity) => {
    setSelectedActivities(prev =>
      prev.includes(activity.Activity)
        ? prev.filter(a => a !== activity.Activity)
        : [...prev, activity.Activity]
    );
  };

  const handleApprove = async () => {
    if (!order) {
      setError('Order data is missing');
      return;
    }

    try {
      setLoading(true);
      console.log('✅ Approving order:', order.OrderNumber);
      // Call your approval API here
      // await moApprovalService.approveOrders([order.OrderNumber]);

      setSuccess('✓ Order approved successfully');
      // setTimeout(() => navigate('/mo-approval'), 2000);
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      setError(err.message || 'Error approving order');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!order) {
      setError('Order data is missing');
      return;
    }

    try {
      setLoading(true);
      console.log('❌ Rejecting order:', order.OrderNumber);
      // Call your rejection API here

      // setSuccess('✓ Order rejected successfully');
      setError('✓ Order rejected successfully');
// setTimeout(() => navigate('/mo-approval'), 2000);
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      setError(err.message || 'Error rejecting order');
    } finally {
      setLoading(false);
    }
  };

  const handleShowHistory = async () => {
    try {
      setShowHistoryDialog(true);
      setHistoryLoading(true);

      // Simulate API call
      console.log('📜 Fetching history for equipment:', order?.Equipment);

      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));

      setHistoryData(SAMPLE_HISTORY);
    } catch (err) {
      setError('Error fetching history: ' + err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!order) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: { xs: 2, sm: 3, md: 4 }
      }}
    >
      <Container maxWidth="xl">
        {/* Back Button */}

        {/* Header Card */}
        <Fade in timeout={600}>
          <Paper
            elevation={6}
            sx={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #1ef729 100%)',
              p: { xs: 2, sm: 3 },
              mt: 0,
              mb: 1,
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden'
            }}
          >

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

            <Box  height={22}  >
              <Typography
                variant={isMobile ? 'h5' : 'h3'}
                sx={{
      color: 'white',
      fontWeight: 700,
      textAlign: 'right',
      textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
      mb: 1 ,
                }}
              >
                {order.OrderNumber}
              </Typography>


            </Box>
            <Typography
              variant="subtitle1"
              sx={{
                color: 'rgb(255, 255, 255)',
                fontWeight: 500,
                mb: -1,
                textAlign: 'right',
                mt: 0
              }}
            >
              {order.OrderDescription}
            </Typography>
          </Paper>
        </Fade>

        {/* Cost Summary Card */}
        <Fade in timeout={800}>
          <Paper
            elevation={4}
            sx={{
              background: 'linear-gradient(135deg, #acd873 0%, #FFE0B2 100%)',
              p: { xs: 2, sm: 3 },
              mb: 1,
              borderRadius: 3
            }}
          >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      {/* <AttachMoneyIcon sx={{ color: '#F57C00', fontSize: 20 }} /> */}
                      <Typography variant="caption" color="red" fontSize={18} textAlign='left'>
                        Total Cost
                      </Typography>
                    <Typography variant="h5" fontWeight={700} color="#1030e7" >
                      ₹ {formatCurrency(order.TotalCost)}
                    </Typography>
                    </Box>

            {/* </Box> */}
          </Paper>
        </Fade>

        {/* Activities Section */}
        <Fade in timeout={1000}>
          <Paper
            elevation={4}
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 1,
              borderRadius: 5,
              background: 'linear-gradient(135deg, #f0dc2f 0%, #4cecd7 100%)'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} color="blue">
                Activities
              </Typography>
              <Chip
                label={`${SAMPLE_ACTIVITIES.length} items`}
                color="warning"
                variant="outlined"
              />
            </Box>

            <Divider sx={{ mb: 1 }} />

            {/* Activities Table */}
            <TableContainer>
              <Table size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#dce0e0' }}>
                    <TableCell sx={{ fontWeight: 700, color: 'black' }}>Activity</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    {!isMobile && (
                      <>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          Qty
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          Rate
                        </TableCell>
                      </>
                    )}
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Amount
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {SAMPLE_ACTIVITIES.map((activity, index) => (
                    <TableRow
                      key={activity.Activity}
                      sx={{
                        backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
                        '&:hover': {
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="primary">
                          {activity.Activity}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: isMobile ? '150px' : '300px' }} noWrap>
                          {activity.Description}
                        </Typography>
                      </TableCell>
                      {!isMobile && (
                        <>
                          <TableCell align="right">
                            <Typography variant="body2">{activity.Quantity}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{activity.Unit}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600}>
                              ₹ {formatCurrency(activity.Rate)}
                            </Typography>
                          </TableCell>
                        </>
                      )}
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700} color="#E65100">
                          ₹ {formatCurrency(activity.Amount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Subtotal */}
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: '2px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <Box sx={{ minWidth: isMobile ? '150px' : '250px' }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight={600}>
                    Subtotal:
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    ₹ {formatCurrency(order.TotalCost)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Fade>

        {/* Action Buttons */}
        <Fade in timeout={1200}>
          <Paper
            elevation={4}
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 1,
              borderRadius: 4
            }}
          >
            <Stack
              direction={isMobile ? 'column' : 'row'}
              spacing={1}
              sx={{ mb: 1 }}
            >
              <div style={{ flex: 1 }} />
              <Button
                fullWidth={isMobile}
                variant="contained"
                size={isMobile ? 'large' : 'medium'}
                startIcon={<CheckCircleIcon />}
                onClick={handleApprove}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                  boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
                  fontWeight: 600,
                  flex: isMobile ? 1 : 0
                }}
              >
                {loading ? 'Processing...' : 'Approve'}
              </Button>

              <Button
                fullWidth={isMobile}
                variant="contained"
                size={isMobile ? 'large' : 'medium'}
                startIcon={<CancelIcon />}
                onClick={handleReject}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(45deg, #F44336 30%, #E91E63 90%)',
                  boxShadow: '0 3px 5px 2px rgba(244, 67, 54, .3)',
                  fontWeight: 600,
                  flex: isMobile ? 1 : 0
                }}
              >
                {loading ? 'Processing...' : 'Reject'}
              </Button>
                
              <Button
                fullWidth={isMobile}
                variant="outlined"
                size={isMobile ? 'large' : 'medium'}
                startIcon={<HistoryIcon />}
                onClick={handleShowHistory}
                sx={{
                  fontWeight: 600,
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  flex: isMobile ? 1 : 0,
                  '&:hover': {
                    backgroundColor: '#e3f2fd',
                    borderColor: '#1976d2'
                  }
                }}
              >
                View History
              </Button>
            </Stack>
          </Paper>
        </Fade>

        {/* History Dialog */}
        <Dialog
          open={showHistoryDialog}
          onClose={() => setShowHistoryDialog(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem' }}>
            📜 Approval History - Equipment: {order.Equipment}
          </DialogTitle>

          <DialogContent sx={{ mt: 2 }}>
            {historyLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table size={isMobile ? 'small' : 'medium'}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Approver</TableCell>
                      {!isMobile && (
                        <>
                          <TableCell sx={{ fontWeight: 700 }}>Requested</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Approved</TableCell>
                        </>
                      )}
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {historyData.map((history, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                        }}
                      >
                        <TableCell>
                          <Chip
                            label={history.Role}
                            size="small"
                            sx={{
                              backgroundColor: '#E3F2FD',
                              color: '#1976d2',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {history.Approver}
                          </Typography>
                        </TableCell>
                        {!isMobile && (
                          <>
                            <TableCell>
                              <Typography variant="body2">{history.RequestedDate}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {history.ApprovedDate} {history.ApprovedTime}
                              </Typography>
                            </TableCell>
                          </>
                        )}
                        <TableCell>
                          <Chip
                            label={history.Status}
                            size="small"
                            sx={{
                              backgroundColor: history.Status === 'Approved' ? '#E8F5E9' : '#FFF3E0',
                              color: history.Status === 'Approved' ? '#388E3C' : '#F57C00',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setShowHistoryDialog(false)} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>

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

export default MoSelected;
