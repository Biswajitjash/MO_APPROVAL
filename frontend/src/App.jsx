import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import CreateUser from './components/CreateUser';
import UpdatePassword from './components/UpdatePassword';
import MoApproval from './components/MoApproval';
import MoDashboard from './components/MoDashboard';
import MoSelected from './components/MoSelected';
import ProtectedRoute from './components/ProtectedRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/create-user" element={<CreateUser />} />
            <Route path="/update-password" element={<UpdatePassword />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MoDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mo-approval" 
              element={
                <ProtectedRoute>
                  <MoApproval />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mo-selected"
              element={
                <ProtectedRoute>
                  <MoSelected/>
                </ProtectedRoute>
              }
            />

            {/* Default Route - Redirect to Login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch All - Redirect to Dashboard if authenticated, else Login */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;





// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
// import { AuthProvider } from './context/AuthContext';
// import Login from './components/Login';
// import CreateUser from './components/CreateUser';
// import UpdatePassword from './components/UpdatePassword';
// import MoApproval from './components/MoApproval';
// import MoDashboard from './components/MoDashboard'; 
// import MoSelected from './components/MoSelected';
// import ProtectedRoute from './components/ProtectedRoute';

// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#667eea',
//     },
//     secondary: {
//       main: '#764ba2',
//     },
//   },
//   typography: {
//     fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
//   },
// });

// function App() {
//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <BrowserRouter>
//         <AuthProvider>
//           <Routes>
//             <Route path="/login" element={<Login />} />
//             <Route path="/mo-dashboard" element={<MoDashboard/>} />
//             <Route path="/mo-approval" element={<MoApproval/>} />
//             <Route path="/create-user" element={<CreateUser />} />
//             <Route path="/update-password" element={<UpdatePassword/>} />
//             <Route path="/mo-selected" element={<MoSelected/>} />
            
//             <Route
//               path="/dashboard"
//               element={
//                 <ProtectedRoute>
//                   <MoDashboard/>
//                   {/* <MoApproval /> */}
//                 </ProtectedRoute>
//               }
//             />
//             <Route path="/" element={<Navigate to="/login" replace />} />
//           </Routes>
//         </AuthProvider>
//       </BrowserRouter>
//     </ThemeProvider>
//   );
// }

// export default App;




// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
// import { AuthProvider } from './context/AuthContext';
// import Login from './components/Login';
// import MoApproval from './components/MoApproval';
// import ProtectedRoute from './components/ProtectedRoute';

// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#1976d2',
//     },
//     secondary: {
//       main: '#dc004e',
//     },
//   },
// });

// function App() {
//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <BrowserRouter>
//         <AuthProvider>
//           <Routes>
//             <Route path="/login" element={<Login />} />
//             <Route
//               path="/dashboard"
//               element={
//                 <ProtectedRoute>
//                   <MoApproval />
//                 </ProtectedRoute>
//               }
//             />
//             <Route path="/" element={<Navigate to="/dashboard" replace />} />
//           </Routes>
//         </AuthProvider>
//       </BrowserRouter>
//     </ThemeProvider>
//   );
// }

// export default App;


// import React from 'react';
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
// import MoApproval from './components/MoApproval';

// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#1976d2',
//     },
//     secondary: {
//       main: '#dc004e',
//     },
//   },
//   typography: {
//     fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
//   },
// });

// function App() {
//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <MoApproval />
//     </ThemeProvider>
//   );
// }

// export default App;