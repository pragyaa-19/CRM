const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function fetchEmployees({ signal } = {}) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/api/employees/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        signal,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Unable to load employees."
        );
    }

    return Array.isArray(data) ? data : data.results ?? [];
}