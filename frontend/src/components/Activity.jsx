
import { useEffect, useState } from "react";

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm ${className}`}
  >
    {children}
  </div>
);

export default function Activity({ refresh }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeads = async () => {
    setLoading(true);
    setError("");

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
        setError("Unable to load activity.");
        return;
      }

      // Handle paginated and unpaginated API responses.
      const leadsList = Array.isArray(data) ? data : data.results;

      setLeads(Array.isArray(leadsList) ? leadsList : []);
    } catch (error) {
      console.error("Fetch leads error:", error);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [refresh]);

  const formatTime = (date) => {
    if (!date) return "";

    const createdDate = new Date(date);

    if (Number.isNaN(createdDate.getTime())) return "";

    const difference = Math.max(0, Date.now() - createdDate.getTime());

    const minutes = Math.floor(difference / (1000 * 60));
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

    if (days === 1) return "Yesterday";

    return `${days} days ago`;
  };

  const activities = [...leads]
    .sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )
    .flatMap((lead) => {
      const activityList = [];

      if (lead.created_at) {
        activityList.push({
          id: `created-${lead.id}`,
          text: `New lead created: ${lead.name}`,
          time: formatTime(lead.created_at),
          createdAt: new Date(lead.created_at).getTime(),
        });
      }

      if (lead.assigned_to_name && lead.created_at) {
        activityList.push({
          id: `assigned-${lead.id}`,
          text: `${lead.name} assigned to ${lead.assigned_to_name}`,
          time: formatTime(lead.created_at),
          createdAt: new Date(lead.created_at).getTime(),
        });
      }

      return activityList;
    })
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 7);

  return (
    <Card>
      <h2 className="text-lg font-bold text-gray-900 mb-1">
        Recent Activity
      </h2>

      <p className="text-sm text-gray-500 mb-6">
        Recent activity from your leads
      </p>

      {loading && (
        <p className="text-sm text-gray-500">
          Loading activity...
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="space-y-5">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500">
              No recent activity.
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 mt-1.5 bg-blue-500 rounded-full" />
                  <div className="w-px h-full bg-gray-200 mt-2" />
                </div>

                <div className="pb-2">
                  <p className="text-sm text-gray-800 font-medium">
                    {activity.text}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
}
