import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const ConfirmRidePopUp = ({
    ride,
    onAccepted,
    setConfirmRidePopUpPanel,
    setRidePopUpPanel
}) => {
    const [isAccepted, setIsAccepted] = useState(ride?.status === "accepted")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [otp, setOtp] = useState("")
    const [error, setError] = useState("")
    const [acceptedRide, setAcceptedRide] = useState(ride?.status === "accepted" ? ride : null)
    const navigate = useNavigate()

    const riderName = [
        ride?.user?.fullname?.firstname,
        ride?.user?.fullname?.lastname
    ].filter(Boolean).join(" ") || "Rider"

    const acceptRide = async () => {
        setIsSubmitting(true)
        setError("")
        try {
            const token = localStorage.getItem("token")
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL || "http://localhost:3000"}/rides/${ride._id}/accept`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setAcceptedRide(response.data.ride)
            setIsAccepted(true)
            onAccepted?.(response.data.ride)
        } catch (requestError) {
            console.error("Failed to accept ride:", requestError.response?.data || requestError)
            setError(
                requestError.response?.data?.message || "Could not accept this ride. Please try again."
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const startRide = async (event) => {
        event.preventDefault()
        if (!ride?._id || otp.length !== 6) return

        setIsSubmitting(true)
        setError("")
        try {
            const token = localStorage.getItem("token")
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL || "http://localhost:3000"}/rides/${ride._id}/start`,
                { otp },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            navigate("/captain-riding", {
                state: { ride: { ...acceptedRide, ...response.data.ride } }
            })
        } catch (requestError) {
            console.error("Failed to verify ride OTP:", requestError.response?.data || requestError)
            setError(
                requestError.response?.data?.message || "Could not verify the OTP. Please try again."
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div>
            <h5 className="p-1 text-center w-[93%] top-0 absolute" onClick={() => {
                if (!isAccepted) {
                    setConfirmRidePopUpPanel(false)
                    setRidePopUpPanel(true)
                }
            }}><i className="text-3xl text-gray-500 ri-arrow-down-wide-line"></i></h5>
            <h2 className="text-2xl font-semibold mb-5">
                {isAccepted ? "Verify the rider's OTP" : "Accept this ride?"}
            </h2>
            <div className="flex items-center justify-between border-2 border-yellow-400 bg-white rounded-lg mt-4 p-3">
                <h2 className="text-lg font-medium">{riderName}</h2>
                <h5 className="text-lg font-semibold">₹{ride?.fare ?? "—"}</h5>
            </div>
            <div className="w-full flex flex-col">
                <div className="w-full flex items-center justify-start gap-5 p-3 border-b-2">
                    <i className="text-lg ri-map-pin-2-fill"></i>
                    <div>
                        <h3 className="font-medium">Pickup</h3>
                        <p className="text-sm mt-1 text-gray-600">{ride?.pickup || "—"}</p>
                    </div>
                </div>
                <div className="w-full flex items-center justify-start gap-5 p-3 border-b-2">
                    <i className="text-lg ri-flag-fill"></i>
                    <div>
                        <h3 className="font-medium">Destination</h3>
                        <p className="text-sm mt-1 text-gray-600">{ride?.destination || "—"}</p>
                    </div>
                </div>
            </div>
            {isAccepted && (
                <form onSubmit={startRide}>
                    <label htmlFor="ride-otp" className="mt-4 block font-medium">
                        Ask the rider for their 6-digit OTP
                    </label>
                    <input
                        id="ride-otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        value={otp}
                        onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                        required
                        className="bg-[#eee] px-6 py-4 font-mono text-base rounded-lg w-full mt-2"
                        placeholder="Enter rider's OTP"
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || otp.length !== 6}
                        className="w-full mt-3 bg-green-600 disabled:opacity-50 text-white font-semibold p-3 rounded-lg"
                    >
                        {isSubmitting ? "Verifying…" : "Verify OTP and start ride"}
                    </button>
                </form>
            )}
            {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
            {!isAccepted && (
                <button
                    type="button"
                    disabled={isSubmitting || !ride?._id}
                    onClick={acceptRide}
                    className="w-full mt-5 bg-green-600 disabled:opacity-50 text-white font-semibold p-3 rounded-lg"
                >
                    {isSubmitting ? "Accepting…" : "Confirm acceptance"}
                </button>
            )}
        </div>
    )
}

export default ConfirmRidePopUp
