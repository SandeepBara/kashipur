import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { getBrowserInfo } from "./utils/browserInfo";
import "./index.scss";
import { LoadingProvider } from "./contexts/LoadingContext";
import LoadingOverlay from "./components/common/LoadingOverlay";
import UserRoutes from "./modules/user/userRoutes";
import SettingRoutes from "./modules/settings";
import CitizenAuth from "./pages/citizen/CitizenAuth";
import Layout from "./layout/Layout";
// import ReportDashboard from "./pages/ReportDashboard";
import Dashboard from "./pages/Dashboard";
import { MenuProvider } from "./components/common/MenuContext";
import AccountsRoute from "./modules/accounts/AccountsRoute";
import SWMRoute from "./modules/swm/index";
import TempPlates from "./pages/TempPlates";
import WasteDashboard from "./pages/WasteDashboard";
import TcInfo from "./pages/TcInfo";
import AboutSWM from "./pages/AboutSWM";
import SwmPaymentReceipt from "./modules/swm/pages/SwmPaymentReceipt";
import SwmDemandReceipt from "./modules/swm/pages/SwmDemandReceipt";

function App() {
  const [browserInfo, setBrowserInfo] = useState({
    latitude: null,
    longitude: null,
    machine: null,
    browser_name: null,
    ip: null,
  });

  useEffect(() => {
    (async () => {
      const info = await getBrowserInfo();
      setBrowserInfo(info);
      localStorage.setItem("browserInfo", JSON.stringify(info));
    })();
  }, []);

  return (
    <MenuProvider>
      {/* <ForceSingleTab />  */}
      <LoadingProvider>
        <Router>
          <LoadingOverlay />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/tc-list" element={<TcInfo />} />
            <Route path="/about-swm" element={<AboutSWM />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user/*" element={<UserRoutes />} />
            <Route path="/settings/*" element={<SettingRoutes />} />
            <Route path="/accounts/*" element={<AccountsRoute />} />
            <Route path="/swm/*" element={<SWMRoute />} />
            <Route path="/template" element={<TempPlates />} />
            
            <Route
              path="/citizen/auth"
              element={
                <Layout>
                  <CitizenAuth />
                </Layout>
              }
            />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reporting/dashboard"
              element={
                <ProtectedRoute>
                  <WasteDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/swm/payment-receipt/:id"
              element={<SwmPaymentReceipt />}
            />
            <Route
              path="/swm/demand-receipt/:id"
              element={<SwmDemandReceipt />}
            />
          </Routes>
        </Router>
        <Toaster />
      </LoadingProvider>
    </MenuProvider>
  );
}

export default App;
