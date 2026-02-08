import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  useTheme,
  useMediaQuery,
  Fade,
  CircularProgress,
  IconButton,
  Tooltip,
  AppBar,
  Toolbar,
  Button
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import ErrorIcon from '@mui/icons-material/Error';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildIcon from '@mui/icons-material/Build';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ApprovalIcon from '@mui/icons-material/Approval';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAuth } from '../context/AuthContext';

// ============================================================================
// SAMPLE DATA
// ============================================================================

const MACHINE_FAULT_TRENDS = [
  { time: '00:00', faults: 45 },
  { time: '02:00', faults: 52 },
  { time: '04:00', faults: 48 },
  { time: '06:00', faults: 65 },
  { time: '08:00', faults: 72 },
  { time: '10:00', faults: 68 },
  { time: '12:00', faults: 78 },
  { time: '14:00', faults: 85 },
  { time: '16:00', faults: 82 },
  { time: '18:00', faults: 90 },
  { time: '20:00', faults: 88 },
  { time: '22:00', faults: 95 }
];

const MAINTENANCE_STATUS = [
  { name: 'Observation', value: 2, color: '#2196F3' },
  { name: 'Work in Progress', value: 3, color: '#FFC107' },
  { name: 'Completed', value: 12, color: '#4CAF50' }
];

const MAINTENANCE_TIME_DATA = [
  { id: 1, equipment: 'ATM_STRIPPER-3_LA', time: '01:43:06', status: 'completed', color: '#4CAF50' },
  { id: 2, equipment: 'ATM_STRIPPER-3_LA', time: '01:13:06', status: 'completed', color: '#4CAF50' },
  { id: 3, equipment: 'ATM_STRIPPER-3_LA', time: '00:53:06', status: 'completed', color: '#4CAF50' },
  { id: 4, equipment: 'ATM_STRIPPER-3_LA', time: '00:03:06', status: 'completed', color: '#4CAF50' }
];

const TOTAL_FAULTS_REPORTED = [
  { equipment: 'ATM_STRIPPER-3_A', faults: 42 },
  { equipment: 'ATM_STRIPPER-3_A', faults: 32 },
  { equipment: 'BACK_ENA_CUTTER-LV1', faults: 22 },
  { equipment: 'BACK_ENA_CUTTER-LV2', faults: 12 }
];

const MAINTENANCE_ACTIVITY_TYPE = [
  { name: 'Breakdown', value: 45, color: '#FF6B6B' },
  { name: 'Breakdown_Ms', value: 28, color: '#FFC107' },
  { name: 'Opportunity', value: 18, color: '#E91E63' },
  { name: 'Preventive', value: 35, color: '#2196F3' },
  { name: 'Repair', value: 20, color: '#FF9800' }
];

// ============================================================================
// KPI CARD COMPONENT
// ============================================================================

const KPICard = ({ title, value, unit, trend, trendValue, icon: Icon, color }) => {
  const isPositive = trend === 'up' ? false : true;
  const TrendIcon = trend === 'up' ? TrendingUpIcon : TrendingDownIcon;

  return (
    <Paper
      elevation={4}
      sx={{
        p: 2.5,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          background: color,
          borderRadius: '50%',
          opacity: 0.1
        }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box flex={1}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
            {title}
          </Typography>
          <Box display="flex" alignItems="baseline" gap={1}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {unit}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `3px solid ${color}30`
          }}
        >
          <Icon sx={{ fontSize: 40, color: color }} />
        </Box>
      </Box>

      <Box
        display="flex"
        alignItems="center"
        gap={0.5}
        sx={{
          backgroundColor: isPositive ? '#C8E6C9' : '#FFCCBC',
          color: isPositive ? '#2E7D32' : '#C62828',
          px: 1.5,
          py: 0.75,
          borderRadius: 1,
          width: 'fit-content'
        }}
      >
        <TrendIcon sx={{ fontSize: 16 }} />
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {trendValue} from yesterday
        </Typography>
      </Box>
    </Paper>
  );
};

// ============================================================================
// NAVIGATION CARD COMPONENT - NEW!
// ============================================================================

const NavigationCard = ({ title, description, icon: Icon, color, onClick, count }) => {
  return (
    <Card
      elevation={6}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `2px solid ${color}30`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 24px ${color}40`,
          border: `2px solid ${color}`,
        }
      }}
    >
      <CardActionArea onClick={onClick}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${color}40`
              }}
            >
              <Icon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box flex={1}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>
                {title}
              </Typography>
              {count !== undefined && (
                <Typography variant="h6" sx={{ fontWeight: 600, color: color }}>
                  {count} Pending
                </Typography>
              )}
            </Box>
            <ArrowForwardIcon sx={{ fontSize: 28, color: color }} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

// ============================================================================
// CHART CARD COMPONENT
// ============================================================================

const ChartCard = ({ title, children, height = 300 }) => {
  return (
    <Paper
      elevation={4}
      sx={{
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)'
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        {title}
      </Typography>

      <Box
        sx={{
          height,
          minHeight: height,   // 👈 critical
          width: '100%'
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};



// const ChartCard = ({ title, children, height = 300 }) => {
//   return (
//     <Paper
//       elevation={4}
//       sx={{
//         p: 3,
//         borderRadius: 3,
//         background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
//         height: 'auto'
//       }}
//     >
//       <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
//         {title}
//       </Typography>
//       <Box sx={{ height: height, width: '100%' }}>
//         {children}
//       </Box>
//     </Paper>
//   );
// };




// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

const MoDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Header AppBar */}
      <AppBar position="static" elevation={6} sx={{ background: 'linear-gradient(45deg, #6aea66 30%, #764ba2 90%)' }}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700 }}>
            MO Approval Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mr: 2, fontWeight: 500 }}>
            {user?.userId || 'User'}
          </Typography>
          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* NAVIGATION CARDS SECTION - NEW! */}
        <Fade in={!loading} timeout={600}>
          <Box mb={1} >
            <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 700, mb: 1, color: '#f10e19' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={1} >
              <Grid item xs={12} md={6}>
                <NavigationCard
                  title="MO Approval"
                  description="Review and approve pending maintenance orders"
                  icon={ApprovalIcon}
                  color="#66ea7c"
                  count={6}
                  onClick={() => navigate('/mo-approval')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <NavigationCard
                  title="Open Notifications"
                  description="View detailed information about selected orders"
                  icon={AssignmentIcon}
                  color="#f750db"
                  onClick={() => navigate('/mo-approval')}
                />
              </Grid>
            </Grid>
          </Box>
        </Fade>


           <Grid item xs={10} sm={6} md={4} mb={2}>
              <ChartCard title="Maintenance Status" height={350}>
                <ResponsiveContainer width="100%" height="60%">
                  <PieChart>
                    <Pie
                      data={MAINTENANCE_STATUS}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={1}
                      dataKey="value"
                    >
                      {MAINTENANCE_STATUS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `${value} Faults`} />
                  </PieChart>
                </ResponsiveContainer>

                <Box mt={3}>
                  {MAINTENANCE_STATUS.map((item, idx) => (
                    <Box key={idx} display="flex" alignItems="center" gap={1} mb={1}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: item.color
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', fontWeight: 600 }}>
                        {item.value} Faults
                      </Typography>
                    </Box>
                  ))}
                </Box>

              </ChartCard>
            </Grid>
 

        {/* KPI CARDS */}
        <Fade in={!loading} timeout={800}>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="Total Faults"
                value="120"
                unit="faults"
                trend="down"
                trendValue="8%"
                icon={ErrorIcon}
                color="#FF6B6B"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="Pending Approval"
                value="6"
                unit="orders"
                trend="down"
                trendValue="12%"
                icon={TimelineIcon}
                color="#FFC107"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="Resolved"
                value="12"
                unit="orders"
                trend="up"
                trendValue="15%"
                icon={CheckCircleIcon}
                color="#4CAF50"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="In Progress"
                value="2"
                unit="orders"
                trend="up"
                trendValue="5%"
                icon={BuildIcon}
                color="#2196F3"
              />
            </Grid>
          </Grid>
        </Fade>

        {/* CHARTS ROW 1 */}
        <Fade in={!loading} timeout={1000}>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={8}>
              <ChartCard title="Machine Fault Trends (24 Hours)" height={350}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MACHINE_FAULT_TRENDS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="time" stroke="#999" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #ddd',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="faults" stroke="#667eea" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
           
          </Grid>
        </Fade>

        {/* CHARTS ROW 2 */}
        <Fade in={!loading} timeout={1200}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ChartCard title="Maintenance Time">
                <Box>
                  {MAINTENANCE_TIME_DATA.map((item, idx) => (
                    <Box
                      key={idx}
                      display="flex"
                      alignItems="center"
                      gap={2}
                      py={1.5}
                      sx={{
                        borderBottom: idx < MAINTENANCE_TIME_DATA.length - 1 ? '1px solid #eee' : 'none'
                      }}
                    >
                      <Box
                        sx={{
                          width: 4,
                          height: 40,
                          backgroundColor: item.color,
                          borderRadius: 2
                        }}
                      />
                      <Box flex={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                          {item.equipment}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: item.color,
                          minWidth: '70px',
                          textAlign: 'right'
                        }}
                      >
                        {item.time}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </ChartCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <ChartCard title="Total Faults Reported" height={280}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={TOTAL_FAULTS_REPORTED}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="equipment"
                      stroke="#999"
                      style={{ fontSize: '12px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #ddd',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => `${value} Faults`}
                    />
                    <Bar dataKey="faults" fill="#667eea" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </Grid>
        </Fade>

        {/* MAINTENANCE ACTIVITY TYPE */}
        <Fade in={!loading} timeout={1400}>
          <Grid container spacing={3} mt={0}>
            <Grid item xs={12} md={6}>
              <ChartCard title="Maintenance Activity Type" height={350}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={MAINTENANCE_ACTIVITY_TYPE}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {MAINTENANCE_ACTIVITY_TYPE.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <ChartCard  title="Activity Type Breakdown" height={300}>
                <Grid container spacing={1}>
                  {MAINTENANCE_ACTIVITY_TYPE.map((item, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Paper
                        sx={{
                          p: 2,
                          background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}05 100%)`,
                          borderLeft: `5px solid ${item.color}`,
                          borderRight: `5px solid ${item.color}`,
                          borderRadius: 3
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1} mb={0}>
                          <Box
                            sx={{
                              width: 10,
                              height: 12,
                              borderRadius: '20%',
                              backgroundColor: item.color
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#e70ba5' }}>
                            {item.name} {item.value}%
                          </Typography>
                        </Box>
                        {/* <Typography variant="h5" sx={{ fontWeight: 700, color: item.color }}>
                          {item.value}%
                        </Typography> */}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </ChartCard>
            </Grid>
          </Grid>
        </Fade>

        {/* Loading Overlay */}
        {loading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            <Box textAlign="center">
              <CircularProgress size={60} sx={{ color: 'white' }} />
              <Typography variant="body1" sx={{ color: 'white', mt: 2 }}>
                Loading dashboard...
              </Typography>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default MoDashboard;
