import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchEmployees } from "../api/employees";

export default function LeadModal({
  onClose,
  currentUser,
  onLeadCreated,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_num: "",
    status: "new",
    assigned_to: "",
  });

  const [employees, setEmployees] = useState([]);

  // Fetch employees using the reusable API function
  useEffect(() => {
    const controller = new AbortController();

    const loadEmployees = async () => {
      try {
        const data = await fetchEmployees({
          signal: controller.signal,
        });

        console.log("Employee API response:", data);

        setEmployees(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching employees:", error);
        }
      }
    };

    loadEmployees();

    return () => controller.abort();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create a new lead
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/leads/api/create-lead/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      console.log("Create Lead response:", response.status, data);

      if (!response.ok) {
        console.error("Create Lead failed:", data);
        return;
      }

      console.log("Lead created successfully!");

      onLeadCreated();
      onClose();
    } catch (error) {
      console.error("Create Lead error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Add New Lead
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead Name
            </label>

            <input
              type="text"
              value={formData.name}
              onChange={handleChange}
              name="name"
              placeholder="Enter lead name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>

            <input
              type="email"
              value={formData.email}
              onChange={handleChange}
              name="email"
              placeholder="lead@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>

            <input
              type="text"
              value={formData.contact_num}
              onChange={handleChange}
              name="contact_num"
              placeholder="Enter phone number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="new">New</option>
              <option value="called">Called</option>
              <option value="interested">Interested</option>
              <option value="lost">Lost</option>
              <option value="won">Won</option>
            </select>
          </div>

          {/* Assigned To */}
          {currentUser?.role === "employee" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>

              <div className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-600">
                {currentUser?.first_name} {currentUser?.last_name}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>

              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">
                  Select employee
                </option>

                {employees.map((employee) => (
                  <option
                    key={employee.id}
                    value={employee.id}
                  >
                    {employee.first_name} {employee.last_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}