import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

// Components
import Navbar from '../components/layout/Navbar';

// Pages
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import VerifyPage from '../pages/VerifyPage';
import DashboardPage from '../pages/DashboardPage';
import AIChatPage from '../pages/AIChatPage';
import MedicationsPage from '../pages/MedicationsPage';
import ChatHistoryPage from '../pages/ChatHistoryPage';
import ProfilePage from '../pages/ProfilePage';

import PrivateRoute from './PrivateRoute';

const AppRoutes = () => {
  const currentUser = useAuthStore((state) => state.user);

  return (
    <Routes>
      {/* Public routes with navbar */}
      <Route 
        path="/" 
        element={
          <>
            <Navbar />
            <HomePage />
          </>
        } 
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerifyPage />} />

      {/* Private routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ai-chat" element={<AIChatPage userId={currentUser?._id} />} />
        <Route path="/medications" element={<MedicationsPage />} />
        <Route path="/chat-history" element={<ChatHistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
