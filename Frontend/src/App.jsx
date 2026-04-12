import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { SplashPage } from './pages/SplashPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { VerificationPage } from './pages/VerificationPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { ResultPage } from './pages/ResultPage';
import { MapViewPage } from './pages/MapViewPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ComplaintPage } from './pages/ComplaintPage';
import { ProfilePage } from './pages/ProfilePage';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('auth_token');
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile-setup" element={<ProfileSetupPage />} />
        <Route path="/verify" element={<VerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/map" element={<MapViewPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/complaints" element={<ComplaintPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
