import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import List from "./pages/List";
import ProtectedRoute from "../../components/common/ProtectedRoute";
import AdminLayout from "../../layout/AdminLayout";
import UserMenuIncludeExclude from "./pages/UserMenuIncludeExclude";
import MobileMenuList from "./pages/MobileMenuList";
import UserMobileMenuIncludeExclude from "./pages/UserMobileMenuIncludeExclude";
import ModalLogView from "./pages/ModalLogView";
import WorkFlow from "./pages/WorkFlow";
import RolePermission from "./pages/RolePermission";
import RoleList from "./pages/RoleList";
import WardList from "./pages/WardList";
import VehicleTypeList from "./pages/VehicleTypeList";
import VehicleList from "./pages/VehicleList";
import DriverList from "./pages/DriverList";
import QueryEditorUI from "./pages/QueryEditorUI";

function SettingRoutes() {
  return (
    <Suspense fallback={<div className="loading">Loading....</div>}>
      <AdminLayout>
        <Routes>
          <Route
            path="/list"
            element={
              <ProtectedRoute>
                <List />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/list"
            element={
              <ProtectedRoute>
                <UserMenuIncludeExclude />
              </ProtectedRoute>
            }
          />
          <Route
            path="/list/mobile"
            element={
              <ProtectedRoute>
                <MobileMenuList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/list/mobile"
            element={
              <ProtectedRoute>
                <UserMobileMenuIncludeExclude />
              </ProtectedRoute>
            }
          />
          <Route
            path="/modalLog/list"
            element={
              <ProtectedRoute>
                <ModalLogView />
              </ProtectedRoute>
            }
          />

          {/* Ward */}
          <Route
            path="/ward/list"
            element={
              <ProtectedRoute>
                <WardList />
              </ProtectedRoute>
            }
          />
          {/* work flow */}
          <Route
            path="/wf/list"
            element={
              <ProtectedRoute>
                <WorkFlow />
              </ProtectedRoute>
            }
          />
          {/* role module */}
          <Route 
            path="/role/list"
            element={
              <ProtectedRoute>
                <RoleList/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/role-permission/list"
            element={
              <ProtectedRoute>
                <RolePermission />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vehicle-type/list"
            element={
              <ProtectedRoute>
                <VehicleTypeList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicle/list"
            element={
              <ProtectedRoute>
                <VehicleList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/list"
            element={
              <ProtectedRoute>
                <DriverList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tools"
            element={
              <ProtectedRoute>
                <QueryEditorUI />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AdminLayout>
    </Suspense>
  );
}

export default SettingRoutes;
