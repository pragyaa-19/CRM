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

function AppRoutes() {
    return (  
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />
                <Route path="/websocket-test/:conversationId" element={<WebSocketTest />} />
                <Route path="/chat" element={<ChatPage />} />
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
                <Route path="/employees" element={<Employees/>} />
                <Route path="/reports" element={<Reports/>} />
                <Route path="/change-password" element={<ChangePassword/>} />
                 
            </Route>


            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;