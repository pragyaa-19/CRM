
import {
  DollarSign,
  Briefcase,
  Activity,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm ${className}`}
  >
    {children}
  </div>
);

const StatCard = ({ title, value, trend, isPositive, icon }) => (
  <Card className="flex flex-col">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
        {icon}
      </div>

      <span
        className={`text-sm font-medium ${
          isPositive ? "text-emerald-600" : "text-red-600"
        }`}
      >
        {isPositive ? "+" : ""}
        {trend}%
      </span>
    </div>

    <div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  </Card>
);

export default function Statecard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      const token = localStorage.getItem("access_token");

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/leads/api/create-lead/?page_size=5",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error("Leads error:", data);
          return;
        }

        // DRF pagination returns an object with results.
        // The fallback also supports an unpaginated array response.
        const leadsList = Array.isArray(data) ? data : data.results;

        setLeads(Array.isArray(leadsList) ? leadsList : []);
      } catch (error) {
        console.error("Fetch leads error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // These currently reflect only the leads returned by this API page.
  const newContacts = leads.length;

  const wonLeads = leads.filter(
    (lead) => lead.status?.toLowerCase() === "won"
  ).length;

  const winRate =
    leads.length > 0
      ? ((wonLeads / leads.length) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Revenue"
        value="$284,500"
        trend="12.5"
        isPositive={true}
        icon={<DollarSign size={24} />}
      />

      <StatCard
        title="Active Deals"
        value="42"
        trend="4.2"
        isPositive={true}
        icon={<Briefcase size={24} />}
      />

      <StatCard
        title="Win Rate"
        value={loading ? "..." : `${winRate}%`}
        trend="2.1"
        isPositive={false}
        icon={<Activity size={24} />}
      />

      <StatCard
        title="New Contacts"
        value={loading ? "..." : newContacts}
        trend="18.2"
        isPositive={true}
        icon={<Users size={24} />}
      />
    </div>
  );
}
