import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import portal layouts and components
import PortalLayout from './components/PortalLayout';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';

// Import authentication pages
import RegisterEmployee from './pages/RegisterEmployee';
import RegisterHod from './pages/RegisterHod';
import ForgotPassword from './pages/ForgotPassword';

// Import employee pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyProfile from './pages/employee/MyProfile';
import IPRProperty from './pages/employee/IPRProperty';
import IPRForm from './pages/employee/IPRForm';
import MySubmissions from './pages/employee/MySubmissions';
import PreviousReturns from './pages/employee/PreviousReturns';
import NotificationsPage from './pages/NotificationsPage';

// Import HOD pages
import HodDashboard from './pages/hod/HodDashboard';
import GenerateRequest from './pages/hod/GenerateRequest';
import Reports from './pages/hod/Reports';
import EmployeeManagement from './pages/hod/EmployeeManagement';
import ReviewApproval from './pages/hod/ReviewApproval';
import IprSubmissionStatus from './pages/hod/IprSubmissionStatus';
import HodPreviousReturns from './pages/hod/PreviousReturns';
import HodNotifications from './pages/hod/Notifications';

import './App.css';

interface LayoutProps {
  children: React.ReactNode;
}

// Reusable Layout wrapper for logged-in government employees
const EmployeeLayout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = () => {
      const saved = localStorage.getItem('ipr_active_user');
      if (saved) {
        try {
          const user = JSON.parse(saved);
          setProfile(user.profile);
        } catch (e) {}
      }
    };
    loadProfile();
    window.addEventListener('storage', loadProfile);
    return () => window.removeEventListener('storage', loadProfile);
  }, []);

  return (
    <div className="flex h-screen bg-[#F7F8FA] text-slate-800 overflow-hidden font-sans">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} role="employee" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onToggleSidebar={() => setCollapsed(!collapsed)} employeeInfo={profile} />
        <main className="flex-1 overflow-y-auto bg-[#F7F8FA]">
          {children}
        </main>
      </div>
    </div>
  );
};

// Reusable Layout wrapper for logged-in HOD
const HodLayout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = () => {
      const saved = localStorage.getItem('ipr_active_user');
      if (saved) {
        try {
          const user = JSON.parse(saved);
          setProfile(user.profile);
        } catch (e) {}
      }
    };
    loadProfile();
    window.addEventListener('storage', loadProfile);
    return () => window.removeEventListener('storage', loadProfile);
  }, []);

  return (
    <div className="flex h-screen bg-[#F7F8FA] text-slate-800 overflow-hidden font-sans">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} role="hod" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onToggleSidebar={() => setCollapsed(!collapsed)} employeeInfo={profile} />
        <main className="flex-1 overflow-y-auto bg-[#F7F8FA]">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes wrapped in PortalLayout */}
        <Route
          path="/"
          element={
            <PortalLayout>
              <Login />
            </PortalLayout>
          }
        />
        <Route
          path="/register/employee"
          element={
            <PortalLayout>
              <RegisterEmployee />
            </PortalLayout>
          }
        />
        <Route
          path="/register/hod"
          element={
            <PortalLayout>
              <RegisterHod />
            </PortalLayout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PortalLayout>
              <ForgotPassword />
            </PortalLayout>
          }
        />

        {/* Logged-In HOD Routes wrapped in HodLayout */}
        <Route
          path="/hod/dashboard"
          element={
            <HodLayout>
              <HodDashboard />
            </HodLayout>
          }
        />
        <Route
          path="/hod/my-profile"
          element={
            <HodLayout>
              <MyProfile />
            </HodLayout>
          }
        />
        <Route
          path="/hod/employee-list"
          element={
            <HodLayout>
              <EmployeeManagement />
            </HodLayout>
          }
        />
        <Route
          path="/hod/send-request"
          element={
            <HodLayout>
              <GenerateRequest />
            </HodLayout>
          }
        />
        <Route
          path="/hod/submission-status"
          element={
            <HodLayout>
              <IprSubmissionStatus />
            </HodLayout>
          }
        />
        <Route
          path="/hod/review-approval"
          element={
            <HodLayout>
              <ReviewApproval />
            </HodLayout>
          }
        />
        <Route
          path="/hod/reports"
          element={
            <HodLayout>
              <Reports />
            </HodLayout>
          }
        />
        <Route
          path="/hod/previous-returns"
          element={
            <HodLayout>
              <HodPreviousReturns />
            </HodLayout>
          }
        />
        <Route
          path="/hod/notifications"
          element={
            <HodLayout>
              <HodNotifications />
            </HodLayout>
          }
        />

        {/* Logged-In Employee Routes wrapped in EmployeeLayout */}
        <Route
          path="/employee/dashboard"
          element={
            <EmployeeLayout>
              <EmployeeDashboard />
            </EmployeeLayout>
          }
        />
        <Route
          path="/employee/my-profile"
          element={
            <EmployeeLayout>
              <MyProfile />
            </EmployeeLayout>
          }
        />
        <Route
          path="/employee/ipr-property"
          element={
            <EmployeeLayout>
              <IPRProperty />
            </EmployeeLayout>
          }
        />
        <Route
          path="/employee/ipr-filing"
          element={
            <EmployeeLayout>
              <IPRForm />
            </EmployeeLayout>
          }
        />
        <Route
          path="/employee/my-submissions"
          element={
            <EmployeeLayout>
              <MySubmissions />
            </EmployeeLayout>
          }
        />
        <Route
          path="/employee/previous-returns"
          element={
            <EmployeeLayout>
              <PreviousReturns />
            </EmployeeLayout>
          }
        />
        <Route
          path="/employee/notifications"
          element={
            <EmployeeLayout>
              <NotificationsPage />
            </EmployeeLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
