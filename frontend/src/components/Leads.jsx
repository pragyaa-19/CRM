
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}
  >
    {children}
  </div>
);

export default function Activity({refresh}) {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  const fetchLeads = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/leads/api/create-lead/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Leads error:", data);
        setError("Unable to load leads.");
        return;
      }

      console.log("LEADS:", data);
      setLeads(data);
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

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "bg-blue-50 text-blue-700 border-blue-100";

      case "called":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";

      case "interested":
        return "bg-purple-50 text-purple-700 border-purple-100";

      case "won":
        return "bg-green-50 text-green-700 border-green-100";

      case "lost":
        return "bg-red-50 text-red-700 border-red-100";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <Card className="lg:col-span-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Recent Leads
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Latest leads added to your CRM
          </p>
        </div>

        <button
          onClick={() => navigate("/lead")}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          View All
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-gray-500">
            Loading leads...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Lead
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Contact
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Stage
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Assigned Email
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  {/* Lead Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-sm">
                        {lead.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">
                          {lead.name}
                        </p>

                        <p className="text-xs text-gray-400">
                          Lead #{lead.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {lead.email || (
                      <span className="text-gray-400">
                        Not provided
                      </span>
                    )}
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {lead.contact_num || (
                      <span className="text-gray-400">
                        Not provided
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium ${getStatusStyle(
                        lead.status
                      )}`}
                    >
                      {lead.status || "Unknown"}
                    </span>
                  </td>

                  {/* Assigned To */}
                  <td className="px-6 py-4">
                    {lead.assigned_to_name ? (
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {lead.assigned_to_name}
                        </p>

                        <p className="text-xs text-gray-400">
                          ID: {lead.assigned_to}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Assigned Email */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {lead.assigned_to_email || (
                      <span className="text-gray-400">
                        Not assigned
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {/* Empty State */}
              {leads.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <p className="text-gray-500 font-medium">
                        No leads found
                      </p>

                      <p className="text-sm text-gray-400 mt-1">
                        Leads will appear here when they are created.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

