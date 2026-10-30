import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
    User,
} from "lucide-react";
import SettingsPopup from "./Settings";
import { isProPlan } from "../utils/subscription";

function Sidebar({ isSidebarOpen, onAddEmployeeClick, currentUser }) {
    const location = useLocation();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const fetchSubscription = async () => {
            setSubscription(null);

            try {
                const accessToken = localStorage.getItem("access_token");

                if (!accessToken) return;

                const response = await fetch(
                    "http://127.0.0.1:8000/subscriptions/my-subscription/",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const responseText = await response.text();

                console.log("Subscription API status:", response.status);
                console.log("Subscription API response:", responseText);

                if (!response.ok) {
                    // FIX: Removed the stray "-" diff artifact
                    throw new Error(
                        `Subscription API failed: ${response.status}\n${responseText}`
                    );
                }

                const data = JSON.parse(responseText);

                if (!cancelled) {
                    setSubscription(data);
                }
            } catch (error) {
                console.error("Subscription fetch failed:", error);

                if (!cancelled) {
                    setSubscription(null);
                }
            }
        };

        fetchSubscription();

        return () => {
            cancelled = true;
        };
    }, [currentUser?.username, currentUser?.company_name]);

    const isPro = isProPlan(subscription);

    const companyName = useMemo(() => {
        return (
            currentUser?.company_name ||
            currentUser?.company?.name ||
            currentUser?.company?.company_name ||
            (
                typeof currentUser?.company === "string" &&
                    isNaN(Number(currentUser.company))
                    ? currentUser.company
                    : null
            ) ||
            "My Company"
        );
    }, [currentUser]);

    const companyInitials = useMemo(() => {
        return (
            companyName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((word) => word[0])
                .join("")
                .toUpperCase() || "MC"
        );
    }, [companyName]);

    const menuItems = useMemo(
        () => [
            {
                icon: <Home size={20} className="text-blue-500" />,
                label: "Dashboard",
                path: "/dashboard",
            },
            {
                icon: <Users size={20} className="text-indigo-500" />,
                label: "Contacts",
                path: "/contacts",
            },
            {
                icon: <Briefcase size={20} className="text-amber-500" />,
                label: "Deals",
                path: "/deals",
                roles: ["owner", "manager"],
            },
            {
                icon: <MessageSquare size={20} className="text-emerald-500" />,
                label: "Chat",
                path: "/chat",
                proOnly: true,
            },
            {
                icon: <BarChart3 size={20} className="text-purple-500" />,
                label: "Reports",
                path: "/reports",
                roles: ["owner", "manager"],
                proOnly: true,
            },

            {
                icon: <UsersRound size={24} className="text-green-500" />,
                label: "Employees",
                path: "/employees",
                roles: ["owner", "manager"],
            },
            {
                icon: <UserPlus size={20} className="text-fuchsia-600" />,
                label: "Add Employees",
                action: onAddEmployeeClick,
                roles: ["owner", "manager"],
            },
            {
                icon: <Info size={20} className="text-sky-500" />,
                label: "Team Info",
                path: "/team-info",
                roles: ["manager", "employee"],
            },
            {
                icon: <User size={20} className="text-rose-500" />,
                label: "Leads",
                path: "/lead",
            },
            {
                icon: <Info size={20} className="text-cyan-600" />,
                label: "All Teams",
                path: "/teams",
                roles: ["owner"],
            },
            {
                icon: <Trash2 size={20} className="text-red-500" />,
                label: "Trash",
                path: "/trash",
                roles: ["owner", "manager"],
            },
        ],
        [onAddEmployeeClick]
    );

    const renderTooltip = (label) => {
        if (isSidebarOpen) return null;

        return (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2.5 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-md opacity-0 invisible -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 whitespace-nowrap z-50">
                {label}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
            </div>
        );
    };

    const visibleMenuItems = menuItems.filter((item) => {
        const hasRole =
            !item.roles || item.roles.includes(currentUser?.role);

        const hasPlan =
            !item.proOnly || isPro;

        return hasRole && hasPlan;
    });

    return (
        <aside
            className={`${isSidebarOpen ? "w-64" : "w-20"
                } transition-all duration-300 bg-white border-r border-gray-200 hidden md:flex flex-col z-20`}
        >
            {/* Company Name */}
            <div className="h-16 flex items-center justify-center border-b border-gray-200 shrink-0 px-3">
                <span
                    title={companyName}
                    className="text-xl font-bold text-blue-600 transition-opacity duration-300 truncate"
                >
                    {isSidebarOpen ? companyName : companyInitials}
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
                {visibleMenuItems.map((item) => {
                    const isActive = item.path === location.pathname;

                    const baseClasses = `group relative w-full flex items-center p-3 rounded-lg transition-colors ${isActive
                        ? "bg-gray-50 text-gray-900 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`;

                    const itemContent = (
                        <>
                            <div className="shrink-0">{item.icon}</div>

                            {isSidebarOpen && (
                                <span
                                    className={`ml-3 font-medium truncate ${isActive ? "font-semibold" : ""
                                        }`}
                                >
                                    {item.label}
                                </span>
                            )}

                            {renderTooltip(item.label)}
                        </>
                    );

                    return item.path ? (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={baseClasses}
                        >
                            {itemContent}
                        </Link>
                    ) : (
                        <button
                            key={item.label}
                            type="button"
                            onClick={item.action}
                            className={baseClasses}
                        >
                            {itemContent}
                        </button>
                    );
                })}
            </nav>

            {/* Settings */}
            <div className="p-4 border-t border-gray-200 shrink-0">
                <button
                    type="button"
                    onClick={() => setIsSettingsOpen((prev) => !prev)}
                    aria-expanded={isSettingsOpen}
                    className="group relative w-full flex items-center p-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                >
                    <Settings size={20} className="shrink-0" />

                    {isSidebarOpen && (
                        <span className="ml-3 font-medium">Settings</span>
                    )}

                    {renderTooltip("Settings")}
                </button>
            </div>
            
            {/* FIX: Changed from <Settings /> to <SettingsPopup /> to match your import and avoid collision with the Lucide Settings icon */}
            <SettingsPopup
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </aside>
    );
}

export default Sidebar;