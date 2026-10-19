import { useContext, useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import SocketContext from "../context/SocketContext"
import { UserDataContext } from "../context/UserContext"
import CaptainAvatar from "../components/CaptainAvatar"

const Riding = () => {
    const { state } = useLocation()
    const navigate = useNavigate()
    const { user } = useContext(UserDataContext)
    const { sendMessage, receiveMessage } = useContext(SocketContext)
    const [ride, setRide] = useState(state?.ride || null)
    const [isLoading, setIsLoading] = useState(!state?.ride)
    const [error, setError] = useState("")
    const [isCancelling, setIsCancelling] = useState(false)
    const [cancelConfirmation, setCancelConfirmation] = useState(false)
    const [isSelectingPayment, setIsSelectingPayment] = useState(false)

    useEffect(() => {
        if (ride) return

        let isMounted = true
        const loadRide = async () => {
            try {
                const token = localStorage.getItem("token")
                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL || "http://localhost:3000"}/rides/active/user`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                if (!isMounted) return
                if (response.data.ride) {
                    setRide(response.data.ride)
                } else {
                    setError("No active ride was found for your account.")
                }
            } catch (requestError) {
                if (!isMounted) return
                console.error("Could not load active rider ride:", requestError.response?.data || requestError)
                setError(requestError.response?.data?.message || "Could not load your ride.")
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        loadRide()
        return () => { isMounted = false }
    }, [ride])

    useEffect(() => {
        if (!user?._id) return
        const joinUser = () => sendMessage("join", { userId: user._id, userType: "user" })
        const unsubscribeConnect = receiveMessage("connect", joinUser)
        joinUser()
        return unsubscribeConnect
    }, [receiveMessage, sendMessage, user?._id])

    useEffect(() => {
        if (ride?.status !== "ongoing") return

        let isMounted = true
        const checkActiveRide = async () => {
            try {
                const token = localStorage.getItem("token")
                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL || "http://localhost:3000"}/rides/active/user`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                if (isMounted && !response.data.ride) {
                    navigate("/home", { replace: true })
                }
            } catch (requestError) {
                console.error("Could not verify active rider ride:", requestError.response?.data || requestError)
            }
        }

        const intervalId = window.setInterval(checkActiveRide, 3000)
        return () => {
            isMounted = false
            window.clearInterval(intervalId)
        }
    }, [navigate, ride?.status])

    useEffect(() => {
        const unsubscribeAccepted = receiveMessage("ride-confirmed", ({ ride: confirmedRide }) => {
            setRide((currentRide) => ({
                ...confirmedRide,
                otp: currentRide?.otp,
                status: confirmedRide.status || "accepted"
            }))
            setError("")
        })
        const unsubscribeStarted = receiveMessage("ride-started", ({ rideId, status }) => {
            setRide((currentRide) => currentRide?._id === rideId
                ? { ...currentRide, status }
                : currentRide)
        })
        const unsubscribeLocation = receiveMessage("captain-location", ({ rideId, location }) => {
            setRide((currentRide) => currentRide?._id === rideId && currentRide.captain
                ? { ...currentRide, captain: { ...currentRide.captain, location } }
                : currentRide)
        })
        const unsubscribeCompleted = receiveMessage("ride-completed", (completion) => {
            const { rideId, status, paymentMethod, paymentStatus, amountCollected } = completion
            setRide((currentRide) => {
                if (currentRide?._id !== rideId) return currentRide
                return { ...currentRide, status, paymentMethod, paymentStatus, amountCollected }
            })
            navigate("/home", { replace: true })
        })
        const unsubscribeCancelled = receiveMessage("ride-cancelled", ({ rideId, status }) => {
            setRide((currentRide) => currentRide?._id === rideId
                ? { ...currentRide, status }
                : currentRide)
        })

        return () => {
            unsubscribeAccepted()
            unsubscribeStarted()
            unsubscribeLocation()
            unsubscribeCompleted()
            unsubscribeCancelled()
        }
    }, [navigate, receiveMessage])

    const cancelRide = async () => {
        if (!ride?._id) return

        setIsCancelling(true)
        setError("")
        try {
            const token = localStorage.getItem("token")
            await axios.post(
                `${import.meta.env.VITE_BASE_URL || "http://localhost:3000"}/rides/${ride._id}/cancel`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setRide((currentRide) => ({ ...currentRide, status: "cancelled" }))
            setCancelConfirmation(false)
        } catch (requestError) {
            console.error("Could not cancel ride:", requestError.response?.data || requestError)
            setError(
                requestError.response?.data?.message || "Could not cancel this ride. Please try again."
            )
        } finally {
            setIsCancelling(false)
        }
    }

    const selectPaymentMethod = async (paymentMethod) => {
        if (!ride?._id) return

        setIsSelectingPayment(true)
        setError("")
        try {
            const token = localStorage.getItem("token")
            const response = await axios.patch(
                `${import.meta.env.VITE_BASE_URL || "http://localhost:3000"}/rides/${ride._id}/payment-method`,
                { paymentMethod },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setRide((currentRide) => ({
                ...currentRide,
                ...response.data.ride,
                captain: {
                    ...currentRide.captain,
                    ...response.data.captain
                }
            }))
        } catch (requestError) {
            console.error("Could not select payment method:", requestError.response?.data || requestError)
            setError(
                requestError.response?.data?.message || "Could not select this payment method."
            )
        } finally {
            setIsSelectingPayment(false)
        }
    }

    if (isLoading) {
        return <div className="p-6">Loading your ride…</div>
    }

    if (error && !ride) {
        return (
            <div className="min-h-screen p-6">
                <p role="alert" className="mb-4 text-red-600">{error}</p>
                <Link to="/home" className="font-semibold underline">Back to home</Link>
            </div>
        )
    }

    const captainName = [
        ride?.captain?.fullname?.firstname,
        ride?.captain?.fullname?.lastname
    ].filter(Boolean).join(" ")
    const driverLocation = ride?.captain?.location
    const mapUrl = driverLocation
        ? `https://www.google.com/maps/search/?api=1&query=${driverLocation.ltd},${driverLocation.lng}`
        : null
    const statusLabel = {
        pending: "Finding your driver",
        accepted: "Your driver is on the way",
        ongoing: "Your ride is in progress",
        completed: "Ride completed"
    }[ride?.status] || "Ride status"
    const vehicleDescription = [
        ride?.captain?.vehicle?.colour,
        ride?.captain?.vehicle?.vehicleType
    ].filter(Boolean).join(" ")

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="relative h-[45vh] min-h-64">
                <img
                    className="h-full w-full object-cover"
                    src="https://www.hanbit.co.kr/data/editor/20210429161116_qvzgnfvw.gif"
                    alt="Ride route map"
                />
                <Link to="/home" className="fixed right-4 top-4 z-10 h-10 w-10 bg-white flex items-center justify-center rounded-full shadow" aria-label="Back to home">
                    <i className="text-large font-medium ri-home-5-line"></i>
                </Link>
                {mapUrl && (
                    <a
                        className="absolute bottom-4 right-4 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow"
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Open driver location in Maps
                    </a>
                )}
            </div>
            <div className="mx-auto max-w-xl space-y-3 p-4">
                <section className="rounded-xl bg-white p-4 shadow-sm">
                    <h1 className="text-xl font-semibold">{statusLabel}</h1>
                    {ride?.captain ? (
                        <div className="mt-3 flex items-center justify-between border-b pb-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <CaptainAvatar captain={ride.captain} />
                                <div>
                                    <h2 className="font-semibold">{captainName || "Your captain"}</h2>
                                    <p className="text-sm capitalize text-gray-600">{vehicleDescription || "Vehicle details unavailable"}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold uppercase">{ride.captain.vehicle?.plate || "—"}</p>
                                <p className="text-sm text-gray-600">Driver</p>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-2 text-sm text-gray-600">Nearby captains have been notified. Driver details will appear here when a captain accepts.</p>
                    )}
                    {ride?.otp && ride.status !== "completed" && (
                        <div className="mt-3 rounded-lg bg-yellow-50 p-3">
                            <p className="text-sm text-gray-700">Share this OTP with your captain to start the ride:</p>
                            <p className="mt-1 font-mono text-2xl font-bold tracking-widest">{ride.otp}</p>
                        </div>
                    )}
                    {driverLocation && (
                        <p className="mt-3 text-sm text-gray-600">
                            Live driver location: {driverLocation.ltd.toFixed(5)}, {driverLocation.lng.toFixed(5)}
                        </p>
                    )}
                    {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
                </section>
                <section className="rounded-xl bg-white p-4 shadow-sm">
                    <div className="border-b py-2">
                        <p className="text-xs uppercase text-gray-500">Pickup</p>
                        <p className="font-medium">{ride?.pickup || "—"}</p>
                    </div>
                    <div className="border-b py-2">
                        <p className="text-xs uppercase text-gray-500">Destination</p>
                        <p className="font-medium">{ride?.destination || "—"}</p>
                    </div>
                    <div className="flex justify-between pt-3">
                        <div>
                            <p>{ride?.paymentMethod === "cash" || !ride?.paymentMethod ? "Cash" : ride.paymentMethod}</p>
                            {ride?.paymentStatus === "paid" && (
                                <p className="text-sm text-green-700">Payment received</p>
                            )}
                        </div>
                        <p className="font-semibold">
                            ₹{ride?.amountCollected ?? ride?.fare ?? "—"}
                            {ride?.amountCollected != null && ride.amountCollected !== ride.fare && (
                                <span className="ml-1 text-xs font-normal text-gray-500">
                                    (fare ₹{ride.fare})
                                </span>
                            )}
                        </p>
                    </div>
                </section>
                {ride?.status === "ongoing" && ride.paymentStatus !== "paid" && (
                    <section className="rounded-xl bg-white p-4 shadow-sm">
                        <h2 className="text-lg font-semibold">Make payment</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Ride fare: ₹{Number(ride.fare).toFixed(2)}
                        </p>
                        {!ride.paymentMethod ? (
                            <div className="mt-3 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    disabled={isSelectingPayment}
                                    onClick={() => selectPaymentMethod("cash")}
                                    className="rounded-lg bg-black p-3 font-semibold text-white disabled:opacity-50"
                                >
                                    {isSelectingPayment ? "Saving…" : "Pay cash"}
                                </button>
                                <button
                                    type="button"
                                    disabled={isSelectingPayment || !ride.captain?.upiId}
                                    onClick={() => selectPaymentMethod("upi")}
                                    className="rounded-lg bg-green-600 p-3 font-semibold text-white disabled:opacity-50"
                                >
                                    {isSelectingPayment ? "Saving…" : "Scan UPI QR"}
                                </button>
                            </div>
                        ) : ride.paymentMethod === "cash" ? (
                            <div className="mt-3 rounded-lg bg-gray-50 p-3">
                                <p className="font-medium">Pay ₹{Number(ride.fare).toFixed(2)} cash to your captain.</p>
                                <button
                                    type="button"
                                    disabled={isSelectingPayment}
                                    onClick={() => selectPaymentMethod("upi")}
                                    className="mt-3 text-sm font-semibold text-green-700 underline disabled:opacity-50"
                                >
                                    Change to UPI QR
                                </button>
                            </div>
                        ) : ride?.captain?.upiId ? (
                            <div className="mt-3 flex flex-col items-center rounded-lg bg-gray-50 p-4">
                                <p className="text-center font-medium">Scan the QR displayed on your captain&apos;s screen to pay ₹{Number(ride.fare).toFixed(2)}.</p>
                                <p className="mt-2 text-sm text-gray-700">Captain UPI ID: {ride.captain.upiId}</p>
                                <p className="mt-2 text-center text-xs text-gray-600">
                                    Complete payment in your UPI app. Your captain will confirm receipt; QR payments are not automatically verified.
                                </p>
                                <button
                                    type="button"
                                    disabled={isSelectingPayment}
                                    onClick={() => selectPaymentMethod("cash")}
                                    className="mt-3 text-sm font-semibold text-gray-700 underline disabled:opacity-50"
                                >
                                    Change to cash
                                </button>
                            </div>
                        ) : (
                            <div className="mt-3 rounded-lg bg-yellow-50 p-3">
                                <p className="text-sm text-gray-800">
                                    Your captain has not added a UPI ID yet. Choose cash or ask the captain to add one.
                                </p>
                                <button
                                    type="button"
                                    disabled={isSelectingPayment}
                                    onClick={() => selectPaymentMethod("cash")}
                                    className="mt-3 rounded-lg bg-black px-4 py-2 font-semibold text-white disabled:opacity-50"
                                >
                                    Pay cash
                                </button>
                            </div>
                        )}
                    </section>
                )}
                {["pending", "accepted"].includes(ride?.status) && (
                    <section className="rounded-xl bg-white p-4 shadow-sm">
                        {cancelConfirmation ? (
                            <>
                                <p className="text-sm text-gray-700">Cancel this ride request? Your captain will be notified.</p>
                                <div className="mt-3 flex gap-3">
                                    <button
                                        type="button"
                                        disabled={isCancelling}
                                        onClick={() => setCancelConfirmation(false)}
                                        className="flex-1 rounded-lg bg-gray-200 p-3 font-semibold text-gray-800 disabled:opacity-50"
                                    >
                                        Keep ride
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isCancelling}
                                        onClick={cancelRide}
                                        className="flex-1 rounded-lg bg-red-600 p-3 font-semibold text-white disabled:opacity-50"
                                    >
                                        {isCancelling ? "Cancelling…" : "Confirm cancel"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setCancelConfirmation(true)}
                                className="w-full rounded-lg border border-red-600 p-3 font-semibold text-red-600"
                            >
                                Cancel ride
                            </button>
                        )}
                    </section>
                )}
                {ride?.status === "cancelled" && (
                    <section className="rounded-xl bg-white p-4 shadow-sm">
                        <p className="font-medium text-red-600">This ride was cancelled.</p>
                        <button
                            type="button"
                            onClick={() => navigate("/home", { replace: true })}
                            className="mt-3 w-full rounded-lg bg-black p-3 font-semibold text-white"
                        >
                            Back to home
                        </button>
                    </section>
                )}
                {ride?.status === "completed" && (
                    <button
                        type="button"
                        onClick={() => navigate("/home", { replace: true })}
                        className="w-full rounded-lg bg-green-600 p-3 font-semibold text-white"
                    >
                        Back to home
                    </button>
                )}
            </div>
        </div>
    )
}

export default Riding
