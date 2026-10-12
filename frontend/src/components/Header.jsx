import {
  BarChart3, Users,
  Menu, X, Search, Bell,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import CurrentUser from '../components/CurrentUser';
export default function Header({ isSidebarOpen, setSidebarOpen }) {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <CurrentUser onUserLoaded={setCurrentUser} />
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="text-gray-500 hover:text-gray-700 hidden md:block">
          <Menu size={20} />
        </button>
        <div className="flex flex-col leading-tight">
          <h1 className="text-xl font-semibold text-gray-800">
            {currentUser?.username}'s Dashboard
          </h1>

          <span className="text-xs font-medium text-blue-600 capitalize mt-1">
            {currentUser?.role}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search deals, contacts..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-sm"
          />
        </div>
        <button className="text-gray-500 hover:text-gray-700 relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
        </button>
        <div className="w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center font-bold text-sm">
          {currentUser?.first_name[0]}{currentUser?.last_name[0]}
        </div>
        <button
          onClick={handleLogout}
          className="text-red-600 hover:text-red-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}