import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Chip,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
  Stack,
  Avatar
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BuildIcon from '@mui/icons-material/Build';
import EventIcon from '@mui/icons-material/Event';
import { formatCurrency, getStatusColor } from '../utils/formatters';

const ApprovalTable = ({
  orders,
  selectedOrders,
  onSelectAll,
  onSelectOrder
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Mobile Card View
  if (isMobile) {
    return (
      <Stack spacing={2}>
        {orders.length === 0 ? (
          <Paper
            elevation={3}
            sx={{
              p: 6,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)'
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No orders found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting filters Selections
            </Typography>
          </Paper>
        ) : (
          orders.map((order) => {
            const isSelected = selectedOrders.includes(order.OrderNumber);

            return (
              <Card
                key={order.OrderNumber}
                elevation={isSelected ? 8 : 3}
                sx={{
                  background: isSelected
                    ? 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                  border: isSelected ? '2px solid #2196F3' : 'none',
                  transition: 'all 0.3s ease',
                  '&:active': {
                    transform: 'scale(0.98)'
                  }
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  {/* Header Row */}
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={1.5}>
                    <Box flex={1}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#1976d2',
                          fontWeight: 700,
                          fontSize: '1.1rem'
                        }}
                      >
                        {order.OrderNumber}
                      </Typography>
                      <Chip
                        label={order.OrderType}
                        size="small"
                        sx={{
                          mt: 0.5,
                          backgroundColor: '#E3F2FD',
                          color: '#1976d2',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => onSelectOrder(order.OrderNumber)}
                      sx={{ p: 0 }}
                    />
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#FF6B35',
                      fontWeight: 600,
                      mb: 1.5,
                      lineHeight: 1.4
                    }}
                  >
                    {order.OrderDescription}
                  </Typography>

                  <Divider sx={{ mb: 1.5 }} />

                  {/* Info Grid */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 1,
                      mb: 1.5
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: '#F3E5F5',
                        borderRadius: 2,
                        p: 1,
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block">
                        Plant
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="#7B1FA2">
                        {order.Plant}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        backgroundColor: '#E8F5E9',
                        borderRadius: 2,
                        p: 1,
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block">
                        Equipment
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="#388E3C">
                        {order.Equipment || '-'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Cost Section */}
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                      borderRadius: 2,
                      p: 1.5,
                      mb: 1.5
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <AttachMoneyIcon sx={{ color: '#F57C00', fontSize: 20 }} />
                      <Typography variant="caption" color="text.secondary">
                        Total Cost
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="#E65100">
                      ₹ {formatCurrency(order.TotalCost)}
                    </Typography>
                  </Box>

                  {/* Status Chip */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={order.StatusShortText}
                      sx={{
                        backgroundColor: getStatusColor(order.StatusShortText),
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        px: 1
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {order.ApproverUsername}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            );
          })
        )}
      </Stack>
    );
  }

  // Tablet & Desktop Table View
  return (
    <TableContainer
      component={Paper}
      elevation={6}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
      }}
    >
      <Table size={isTablet ? 'small' : 'medium'}>
        <TableHead>
          <TableRow
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            }}
          >
            <TableCell padding="checkbox">
              <Checkbox
                sx={{ color: 'white' }}
                checked={orders.length > 0 && selectedOrders.length === orders.length}
                indeterminate={
                  selectedOrders.length > 0 && selectedOrders.length < orders.length
                }
                onChange={onSelectAll}
              />
            </TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Order No.</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Type</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Description</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Plant</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Equipment</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700, textAlign: 'right' }}>
              Total Cost
            </TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700 }}>User</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center">
                <Box py={6}>
                  <Typography variant="h6" color="text.secondary">
                    No orders found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Try adjusting your filters
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order, index) => {
              const isSelected = selectedOrders.includes(order.OrderNumber);

              return (
                <TableRow
                  key={order.OrderNumber}
                  hover
                  selected={isSelected}
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
                    '&.Mui-selected': {
                      backgroundColor: '#E3F2FD !important'
                    },
                    '&:hover': {
                      backgroundColor: '#f5f5f5 !important'
                    }
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => onSelectOrder(order.OrderNumber)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="primary">
                      {order.OrderNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.OrderType}
                      size="small"
                      sx={{
                        backgroundColor: '#E3F2FD',
                        color: '#1976d2',
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: isTablet ? 150 : 250 }}>
                    <Typography variant="body2" noWrap>
                      {order.OrderDescription}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {order.Plant}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.Equipment || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={700} color="#E65100">
                      ₹ {formatCurrency(order.TotalCost)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.StatusShortText}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(order.StatusShortText),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {order.ApproverUsername}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ApprovalTable;
