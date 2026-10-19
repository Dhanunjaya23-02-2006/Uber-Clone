import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const CaptainLogout = () => {
    const token = localStorage.getItem("token")
    const navigate = useNavigate()
    const [error, setError] = useState("")

    useEffect(() => {
        const logout = async () => {
            try {
                await axios.get(
                    `${import.meta.env.VITE_BASE_URL || "http://localhost:3000"}/captains/logout`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                localStorage.removeItem("token")
                navigate("/captain-login")
            } catch (logoutError) {
                console.error("Failed to log out captain:", logoutError)
                setError("Could not log out. Please try again.")
            }
        }

        logout()
    }, [navigate, token])

    return <div>{error || "Logging out..."}</div>
}

export default CaptainLogout
