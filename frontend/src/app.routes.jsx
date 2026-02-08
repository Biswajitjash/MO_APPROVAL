/**
 * App Routing Configuration
 * Routes for MO Approval System with Dashboard
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import MoDashboard from './components/Dashboard/MoDashboard';
import MoApproval from './components/MoApproval/MoApproval';
import MoSelected from './components/MoApproval/MoSelected';

/**
 * Main routing configuration
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Dashboard Route */}
      <Route path="/dashboard" element={<MoDashboard />} />

      {/* MO Approval Routes */}
      <Route path="/mo-approval" element={<MoApproval />} />
      <Route path="/mo-selected" element={<MoSelected />} />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Catch-all Route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;

/**
 * Usage in App.jsx:
 * 
 * import { BrowserRouter } from 'react-router-dom';
 * import AppRoutes from './routes/AppRoutes';
 * 
 * function App() {
 *   return (
 *     <BrowserRouter>
 *       <AppRoutes />
 *     </BrowserRouter>
 *   );
 * }
 */



// // app.routes.jsx or update your existing routing file
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import MoApproval from './components/MoApproval/MoApproval';
// import MoSelected from './components/MoApproval/MoSelected';



// const AppRoutes = () => {
//   return (
//     <Routes>
//       <Route path="/mo-approval" element={<MoApproval />} />
//       <Route path="/mo-selected" element={<MoSelected />} />
//       {/* Add other routes here */}
//     </Routes>
//   );
// };

// export default AppRoutes;
