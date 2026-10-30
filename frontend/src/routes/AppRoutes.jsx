import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Leads from "../pages/Leads";
import AddEmployee from "../pages/AddEmployee";
import AcceptInvitation from "../pages/AcceptInvitation";
import Teams from "../pages/Teams";
import ProtectedRoute from "../components/ProtectedRoute";
import TeamDetails from "../pages/TeamDetails";
import Contacts from "../pages/Contacts";
import Trash from "../pages/Trash";
import Employees from "../pages/Employees";
import Reports from "../pages/Reports";
import WebSocketTest from "../pages/WebSocketTest";
import ChatPage from "../components/ChatPage";
import PasswordResetRequest from "../pages/PasswordResetRequest";
import PasswordResetConfirm from "../pages/PasswordResetConfirm";
import ChangePassword from "../pages/ChangePassword";
import SubscriptionManagement from "../pages/SubscriptionManagement";
import SubscriptionSuccess from "../pages/SubscriptionSuccess";
import RequireProPlan from "../components/RequireProPlan"
function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />
                <Route path="/password-reset" element={<PasswordResetRequest />} />
                <Route path="/password-reset/confirm/:token" element={<PasswordResetConfirm />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/lead" element={<Leads />} />
                    <Route path="/invite" element={<AddEmployee />} />
                    <Route path="/teams" element={<Teams />} />
                    <Route path="/teams/:id" element={<TeamDetails />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/trash" element={<Trash />} />
                    <Route path="/employees" element={<Employees />} />
                    <Route
                        path="/reports"
                        element={
                            <RequireProPlan>
                                <Reports />
                            </RequireProPlan>
                        }
                    />

                    <Route
                        path="/chat"
                        element={
                            <RequireProPlan>
                                <ChatPage />
                            </RequireProPlan>
                        }
                    />

                    <Route path="/websocket-test/:conversationId"
                        element={
                            <RequireProPlan>
                                <WebSocketTest />
                            </RequireProPlan>
                        }
                    />

                    <Route
                        path="/change-password"
                        element={<ChangePassword />} />
                    <Route
                        path="/subscription/manage"
                        element={<SubscriptionManagement />}
                    />
                    <Route
                        path="/subscription/success"
                        element={<SubscriptionSuccess />}
                    />
                </Route>


            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;