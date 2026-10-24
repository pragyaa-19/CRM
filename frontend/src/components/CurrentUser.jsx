import { useState, useEffect } from "react";

export default function CurrentUser({onUserLoaded}) {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch(
                    "http://127.0.0.1:8000/api/me/",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        },
                    }
                );
                const data = await response.json();

                if (!response.ok) {
                    console.error("failed to fetch");
                    return;
                }
                setCurrentUser(data)
                //console.log("Current user fetched:", data);
                onUserLoaded(data)
            } catch (error) {
                console.error("Error fecging current user")
            }
        };
        fetchCurrentUser();

    }, []);

    return 
}