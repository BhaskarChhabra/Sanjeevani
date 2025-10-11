/* eslint-disable no-irregular-whitespace */
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import SidebarNavbar from './components/layout/SidebarNavbar';

// Define the two possible widths
// ... (imports remain the same)

// Define the two possible widths
const SIDEBAR_WIDTH_EXPANDED = '240px'; 
const SIDEBAR_WIDTH_COLLAPSED = '80px'; 

function App() {
  const location = useLocation();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  // Logic to determine if sidebar should be shown (remains unchanged)
  const showSidebar = location.pathname !== '/' &&
                      location.pathname !== '/login' &&
                      location.pathname !== '/register' &&
                      location.pathname !== '/verify';

  // 2. Determine the current effective width
  const currentSidebarWidth = isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
  
  const mainContentBg = showSidebar ? '#f5f0fb' : 'transparent'; 
  const privateRouteBg = '#10172A'; 

  return (
    <div style={{ 
        display: 'flex', 
        minHeight: '100vh', 
        overflowX: 'hidden',
        // ✅ CRITICAL FIX 1: Allow the whole app wrapper to scroll if needed (though usually handled by body)
        // If the entire page is scrolling, you'd apply the main scroll here, 
        // but since you have a fixed sidebar, let's focus on the content area.
    }}>
      {showSidebar && (
        <SidebarNavbar 
          isCollapsed={isCollapsed} 
          toggleCollapse={toggleCollapse} 
        />
      )}

      <div
        style={{
          marginLeft: showSidebar ? currentSidebarWidth : '0',
          flexGrow: 1,
          padding: 0,
          backgroundColor: showSidebar ? privateRouteBg : mainContentBg,
          transition: 'margin-left 0.3s ease',
          width: showSidebar ? `calc(100% - ${currentSidebarWidth})` : '100%',
          
          // ✅ CRITICAL FIX 2: Ensure the content area takes full height and scrolls
          height: '100vh', // Takes the full viewport height
          overflowY: 'auto', // Enables scrolling for this div when content overflows
        }}
      >
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;