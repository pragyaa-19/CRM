import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const EmployeesContext = createContext(null);

const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export function EmployeesProvider({ children }) {
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [employeeError, setEmployeeError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function fetchEmployees() {
            try {
                setLoadingEmployees(true);
                setEmployeeError("");

                const token = localStorage.getItem("access_token");

                const response = await fetch(
                    `${API_URL}/api/employees/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controller.signal,
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Unable to load employees."
                    );
                }

                const employeeList = Array.isArray(data)
                    ? data
                    : data.results ?? [];

                setEmployees(employeeList);
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Employees API error:", error);
                    setEmployeeError(
                        error.message || "Unable to load employees."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoadingEmployees(false);
                }
            }
        }

        fetchEmployees();

        return () => controller.abort();
    }, []);

    return (
        <EmployeesContext.Provider
            value={{
                employees,
                loadingEmployees,
                employeeError,
                setEmployees,
            }}
        >
            {children}
        </EmployeesContext.Provider>
    );
}

export function useEmployees() {
    const context = useContext(EmployeesContext);

    if (!context) {
        throw new Error(
            "useEmployees must be used inside EmployeesProvider."
        );
    }

    return context;
}