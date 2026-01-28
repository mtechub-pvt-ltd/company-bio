import './App.css';
import React from "react";
import { restoreAuth } from './store/slices/authSlice';
import { scheduleAutoLogout } from './helper_functions/authhelper';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import TicketManagement from './pages/ticketsystem/Ticketmanagement'
import { useNavigate } from "react-router-dom";
import Login from "././pages/Login";
import Emailverification from "././pages/Emailverification";
import OtpVerification from "././pages/Otpverification";
import SetPassword from "././pages/Setpassword";
import Dashboard from "././pages/Dasboard";
import AccountExecutive from "././pages/AccountExecutive/index";
import AccountExecutiveDetails from "././pages/AccountExecutive/AccountExecutiveDetails";
import CompanyAdmin from "././pages/CompanyAdmin/index";
import CompanyAdminDetails from "././pages/CompanyAdmin/CompanyAdminDetails";
import TotalUsers from "././pages/TotalUsers/index";
import Workers from "././pages/Workers/index";
// import WorkerDetails from "././pages/Workers/WorkerDetails";
import CommissionManagement from "././pages/CommissionManagement";
import BillingSubscriptions from "././pages/BillingSubscriptions";
import PayoutLogs from "././pages/PayoutLogs";
// import BroadcastToAdmin from "././pages/BroadcastToAdmin";
// import SupportInbox from "././pages/SupportInbox";
import ContentManagement from "./pages/ContentManagement/ContentManagement";
import SystemOversight from "././pages/SystemOversight";
import SystemOversightDetail from "././pages/SystemOversightDetail";
import Notifications from "././pages/Notifications";
import SystemConfiguration from "././pages/SystemConfiguration/SystemConfiguration";
import GeneralSettings from "././pages/SystemConfiguration/GeneralSettings";
import AccountSettings from "././pages/SystemConfiguration/AccountSettings";
import PrivacyAndSharing from "././pages/SystemConfiguration/PrivacyAndSharing";
import Notification from "././pages/SystemConfiguration/Notification";
import LoginSecurity from "././pages/SystemConfiguration/LoginSecurity";
import SystemSettings from "././pages/SystemConfiguration/SystemSettings";
import UpdatePassword from "././pages/Updatepassword";
import Messages from "././pages/Messages";
import AccountExecutiveMessages from "././pages/Messages/AccountExecutiveMessages";
import CompanyAdminMessages from "././pages/Messages/CompanyAdminMessages";
import DeleteRequests from './pages/DeleteRequests/DeleteRequests';
import PrivateRoute from './privateRoutes';
import PublicRoute from './publicRoutes';
import { useEffect } from 'react';
import { clearAuth, setToken } from './store/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import url from './url';
import { checkToken } from './store/thunks/authThunks';
import { GlobalStyles } from '@mui/material';
import TestLogin from './pages/TestingLogout';
import ContactUsRequests from "./pages/ContactUsRequests/ContactUsRequest"
import BrowserBackHandler from './components/BrowserBackHandler';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { Toaster } from 'react-hot-toast';
import i18n from './multiLingual';
import WokerDetails from './pages/Workers/WokerDetails';
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions"
import useGlobalUnreadCount from './hooks/useGlobalUnreadCount';

function App() {
  const dispatch = useDispatch();
  
  // Initialize global unread count fetching - this keeps message counts
  // available in the sidebar across all pages, not just the Messages page
  useGlobalUnreadCount();

  // Get browser language function
  const getBrowserLanguage = () => {
    const browserLang = navigator.language || navigator.userLanguage;
    console.log('Browser language detected:', browserLang);
    
    // Extract language code (e.g., 'es-ES' -> 'es', 'en-US' -> 'en')
    const langCode = browserLang.split('-')[0].toLowerCase();
    console.log('🌐 Language code:', langCode);
    
    // Map to supported languages
    const supportedLanguages = {
      'es': 'es', // Spanish
      'en': 'en', // English
    };
    
    // Return supported language or default to English
    const detectedLang = supportedLanguages[langCode] || 'en';
    console.log('🌐 Mapped to language:', detectedLang);
    
    return detectedLang;
  };
   

  useEffect(() => {
    // Restore auth from localStorage on app load
    dispatch(restoreAuth());
    const storedAuth = JSON.parse(localStorage.getItem('auth'));

    if (storedAuth?.tokenExpiry) {
      scheduleAutoLogout(dispatch, storedAuth.tokenExpiry);
    }

    // Auto-detect and set language based on browser language only if no saved language
    const savedLang = localStorage.getItem('lang');
    if (!savedLang) {
      const detectedLanguage = getBrowserLanguage();
      console.log('🌐 Setting language to:', detectedLanguage);
      i18n.changeLanguage(detectedLanguage);
      localStorage.setItem('lang', detectedLanguage);
    }
  }, []);
  const navigate = useNavigate();
  const location = useLocation();

  // useEffect(() => {
  //   const publicRoutes = ['/', '/emailverification', '/otpverification', '/setpassword'];

  //   if (publicRoutes.includes(location.pathname.toLowerCase())) {
  //     return; // Skip token check on public routes
  //   }

  //   dispatch(checkToken())
  //     .unwrap()
  //     .then((res) => {
  //       console.log('✅ Token is valid:', res);
  //     })
  //     .catch((err) => {
  //       console.error('❌ Token check failed:', err);
  //       navigate('/');
  //     });
  // }, [dispatch, navigate, location.pathname]);

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            'input:-webkit-autofill': {
              boxShadow: '0 0 0px 1000px white inset !important',
              WebkitTextFillColor: '#000 !important',
              borderRadius: '2px',
            },
          }}
        />
<Toaster/>
      <BrowserBackHandler fallback="/dashboard" />

        <Routes>
          {/* Public Routes */}
          <Route path={`/`} element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path={`/emailverification`} element={<Emailverification />} />
          <Route path={`/otpverification`} element={<OtpVerification />} />
          <Route path={`/setpassword`} element={<SetPassword />} />

          {/* Private Routes */}
          <Route path={`/dashboard`} element={
            // <PrivateRoute>
            //   <Dashboard />
            // </PrivateRoute>
            <Dashboard />
          } />
          <Route path={`/account-executive`} element={
            <PrivateRoute>
              <AccountExecutive />
            </PrivateRoute>
          } />
          <Route path={`/account-executive-details`} element={
            <PrivateRoute>
              <AccountExecutiveDetails />
            </PrivateRoute>
          } />
          <Route path={`/ticketmanagement`} element={
            <PrivateRoute>
              <TicketManagement/>
            </PrivateRoute>
          } />
          <Route path={`/company-admin`} element={
            <PrivateRoute>
              <CompanyAdmin />
            </PrivateRoute>
          } />
          <Route path={`/company-admin-details`} element={
            <PrivateRoute>
              <CompanyAdminDetails />
            </PrivateRoute>
          } />
          <Route path={`/total-users`} element={
            <PrivateRoute>
              <TotalUsers />
            </PrivateRoute>
          } />

           <Route path={`/delete-requests`} element={
            <PrivateRoute>
              <DeleteRequests />
            </PrivateRoute>
          } />
          <Route path={`/workers`} element={
            <PrivateRoute>
              <Workers />
            </PrivateRoute>
          } />
          <Route path={`/worker-details`} element={
            <PrivateRoute>
              <WokerDetails/>
            </PrivateRoute>
          } />
          {/* <Route path={`/worker-details`} element={
            <PrivateRoute>
              <WorkerDetails />
            </PrivateRoute>
          } /> */}
          <Route path={`/commission-management`} element={
            <PrivateRoute>
              <CommissionManagement />
            </PrivateRoute>
          } />
          <Route path={`/billing-subscriptions`} element={
            <PrivateRoute>
              <BillingSubscriptions />
            </PrivateRoute>
          } />
          <Route path={`/payout-logs`} element={
            <PrivateRoute>
              <PayoutLogs />
            </PrivateRoute>
          } />
          <Route path={`/test`} element={
            <PrivateRoute>
              <TestLogin />
            </PrivateRoute>
          } />
          
          <Route path={`/content-management`} element={
            <PrivateRoute>
              <ContentManagement />
            </PrivateRoute>
          } />
          <Route path={`/system-oversight`} element={
            <PrivateRoute>
              <SystemOversight />
            </PrivateRoute>
          } />
          <Route path={`/system-oversight-detail`} element={
            <PrivateRoute>
              <SystemOversightDetail />
            </PrivateRoute>
          } />
          <Route path={`/notifications`} element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          } />
          <Route path={`/system_configuration`} element={
            <PrivateRoute>
              <SystemConfiguration />
            </PrivateRoute>
          } />
          <Route path={`/general_settings`} element={
            <PrivateRoute>
              <GeneralSettings />
            </PrivateRoute>
          } />
             <Route path={`/terms-conditions`} element={
            <PrivateRoute>
              <TermsConditions />
            </PrivateRoute>
          } />
             <Route path={`/privacy-policy`} element={
            <PrivateRoute>
              <PrivacyPolicy />
            </PrivateRoute>
          } />
             <Route path={`/contact-us-requests`} element={
            <PrivateRoute>
              <ContactUsRequests />
            </PrivateRoute>
          } />
          <Route path={`/account_settings`} element={
            <PrivateRoute>
              <AccountSettings />
            </PrivateRoute>

            
          } />
          {/* <Route path={`/privacy_and_sharing`} element={
            <PrivateRoute>
              <PrivacyAndSharing />
            </PrivateRoute>
          } /> */}
          <Route path={`/notification`} element={
            <PrivateRoute>
              <Notification />
            </PrivateRoute>
          } />
          <Route path={`/login_security`} element={
            <PrivateRoute>
              <LoginSecurity />
            </PrivateRoute>
          } />
          <Route path={`/system_settings`} element={
            <PrivateRoute>
              <SystemSettings />
            </PrivateRoute>
          } />
          <Route path={`/updatepassword`} element={
            <PrivateRoute>
              <UpdatePassword />
            </PrivateRoute>
          } />
          <Route path={`/messages`} element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          } />
          <Route path={`/account-executive-messages`} element={
            <PrivateRoute>
              <AccountExecutiveMessages />
            </PrivateRoute>
          } />
          <Route path={`/company-admin-messages`} element={
            <PrivateRoute>
              <CompanyAdminMessages />
            </PrivateRoute>
          } />
        </Routes>
      </ThemeProvider>
    </>
  );
}

export default App;




