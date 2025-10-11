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
import ChatSessionPage from '../pages/ChatSessionPage'; 
import ProfilePage from '../pages/ProfilePage';
import MedicalSummaryPage from '../pages/MedicalSummaryPage'; 
// import LocalHealthMap from '../pages/LocalHealthMap'; // <-- DELETE THIS LINE
import PrivateRoute from './PrivateRoute';
import ReminderAIPage from "../pages/ReminderAIPage";
import ForgotPassword from '../pages/ForgotPassword.jsx';
import VerifyResetOtp from '../pages/VerifyResetOtp.jsx';
import ResetPassword from '../pages/ResetPassword.jsx';
import MedicineComparePage from '../pages/MedicineComparePage.jsx'; 
// This is the correct component you built
import LocalHealthMapPage from '../pages/LocalHealthMapPage.jsx';
import FindMedicalServicesPage from '../pages/FindMedicalServiesPage.jsx';

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
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* This route is now correct */}
     
      {/* Private routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ai-chat" element={<AIChatPage userId={currentUser?._id} />} />
        <Route path="/medications" element={<MedicationsPage />} />
        <Route path="/chat-history" element={<ChatHistoryPage />} />
        <Route path="/chat/:chatId" element={<ChatSessionPage />} /> 
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/app" element={<Navigate to="/dashboard" replace />} />
        <Route path="/medical-summary" element={<MedicalSummaryPage />} />
        <Route path="/reminder-ai" element={<ReminderAIPage />} />
        <Route path="/local-health-map" element={<LocalHealthMapPage />} />
      <Route path="/find-medical-services" element={<FindMedicalServicesPage />} />
          <Route path="/medicine-compare" element={<MedicineComparePage />} />
 
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;