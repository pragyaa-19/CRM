import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Briefcase,
  MessageSquare,
  BarChart3,
  UserPlus,
  Settings,
  UsersRound,
  Info,
  Trash2,
  User
} from 'lucide-react';

function Sidebar({ isSidebarOpen, onAddEmployeeClick, currentUser }) {
  // Get the current URL path to determine which item is active
  const location = useLocation();

  const menuItems = [
    { icon: <Home size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <Users size={20} />, label: "Contacts", path: "/contacts" },
    { icon: <Briefcase size={20} />, label: "Deals", path: "/deals", roles: ['owner', "manager"] },
    { icon: <MessageSquare size={20} />, label: "Chat", path: "/chat" },
    { icon: <BarChart3 size={20} />, label: "Reports", path: "/reports", roles: ['owner', "manager"] },
    { icon: <UsersRound size={24} color="#3bf683" />, label: "Employees", path: "/employees", roles: ['owner', "manager"] },
    { icon: <UserPlus size={20} color='#7b16ba' />, label: "Add Employees", action: onAddEmployeeClick, roles: ['owner', "manager"] },
    { icon: <Info size={20} />, label: "Team Info", path: "/team-info", roles: ["manager", "employee"] }, // Added fallback path just in case
    { icon: <User size={20} />, label: "Leads", path: "/lead" },
    { icon: <Info size={20} />, label: "All Teams", path: "/teams", roles: ['owner'] },
    { icon: <Trash2 size={20} />, label: "Trash", path: "/trash", roles: ['owner', 'manager'] }
  ];

  return (
    <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-white border-r border-gray-200 hidden md:flex flex-col z-20`}>
      <div className="h-16 flex items-center justify-center border-b border-gray-200 shrink-0">
        <span className="text-xl font-bold text-blue-600 transition-opacity duration-300">
          {isSidebarOpen ? 'CRM Flow' : 'CF'}
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {menuItems
          .filter((item) => {
            if (!item.roles) return true;
            return item.roles.includes(currentUser?.role);
          })
          .map((item, i) => {
            // Check if the current URL matches the item's path
            const isActive = item.path === location.pathname;

            // Added 'group' and 'relative' for the hover tooltip logic
            const baseClasses = `group relative w-full flex items-center p-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`;

            // We extract the inner content to avoid repeating it for both Link and Button
            const ItemContent = () => (
              <>
                <div className="shrink-0">{item.icon}</div>
                
                {/* Text for expanded state */}
                {isSidebarOpen && (
                  <span className="ml-3 font-medium truncate">{item.label}</span>
                )}

                {/* Tooltip for collapsed state */}
                {!isSidebarOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2.5 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-md opacity-0 invisible -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 whitespace-nowrap z-50">
                    {item.label}
                    {/* Tooltip Arrow */}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </>
            );

            if (item.path) {
              return (
                <Link key={i} to={item.path} className={baseClasses}>
                  <ItemContent />
                </Link>
              );
            }

            return (
              <button key={i} onClick={item.action} className={baseClasses}>
                <ItemContent />
              </button>
            );
          })}
      </nav>

      <div className="p-4 border-t border-gray-200 shrink-0">
        <button className="group relative w-full flex items-center p-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">
          <Settings size={20} className="shrink-0" />
          {isSidebarOpen && <span className="ml-3 font-medium">Settings</span>}
          
          {!isSidebarOpen && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2.5 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-md opacity-0 invisible -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 whitespace-nowrap z-50">
              Settings
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;