import React from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import SidebarNavbar from './components/layout/SidebarNavbar';

const SIDEBAR_WIDTH = '240px';

function App() {
  const location = useLocation();

  // Only show sidebar for private/dashboard routes
  const showSidebar = location.pathname !== '/' &&
                      location.pathname !== '/login' &&
                      location.pathname !== '/register' &&
                      location.pathname !== '/verify';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {showSidebar && <SidebarNavbar />}

      <div
        style={{
          marginLeft: showSidebar ? SIDEBAR_WIDTH : '0',
          flexGrow: 1,
          padding: 0,
          backgroundColor: showSidebar ? '#00122e' : 'transparent'
        }}
      >
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
