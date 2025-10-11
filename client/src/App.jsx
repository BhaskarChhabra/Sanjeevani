import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import SidebarNavbar from './components/layout/SidebarNavbar';
import useAuthStore from './store/useAuthStore';

// Sidebar widths
const SIDEBAR_WIDTH_EXPANDED = '240px';
const SIDEBAR_WIDTH_COLLAPSED = '80px';

function App() {
  const location = useLocation();
  const { isAuthenticated, user, login } = useAuthStore();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => setIsCollapsed(prev => !prev);

  // Show sidebar only for private routes
  const showSidebar =
    location.pathname !== '/' &&
    location.pathname !== '/login' &&
    location.pathname !== '/register' &&
    location.pathname !== '/verify';

  const currentSidebarWidth = isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
  const mainContentBg = showSidebar ? '#f5f0fb' : 'transparent';
  const privateRouteBg = '#10172A';

  // ✅ Restore user from localStorage if needed
  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem('auth');
      if (storedUser) {
        login(JSON.parse(storedUser));
      }
    }
  }, [user, login]);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      {showSidebar && <SidebarNavbar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />}

      <div
        style={{
          marginLeft: showSidebar ? currentSidebarWidth : '0',
          flexGrow: 1,
          padding: 0,
          backgroundColor: showSidebar ? privateRouteBg : mainContentBg,
          transition: 'margin-left 0.3s ease',
          width: showSidebar ? `calc(100% - ${currentSidebarWidth})` : '100%',
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* ✅ Protect routes: Redirect to login if not authenticated */}
        {showSidebar && !isAuthenticated ? <Navigate to="/login" /> : <AppRoutes />}
      </div>
    </div>
  );
}

export default App;
