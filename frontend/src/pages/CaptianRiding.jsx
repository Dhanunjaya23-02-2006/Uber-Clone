import { Link, useLocation, useNavigate } from "react-router-dom"
import { useContext, useEffect, useRef, useState } from "react"
import axios from "axios"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import logo from "../assets/uberlogo.png"
import FinishRide from "../components/FinishRide"
import SocketContext from "../context/SocketContext"
import { CaptainDataContext } from "../context/CaptianContext"

const CaptianRiding = () => {
    const { state } = useLocation()
    const navigate = useNavigate()
    const { captain } = useContext(CaptainDataContext)
    const { sendMessage, receiveMessage } = useContext(SocketContext)
    const [isCaptainConnected, setIsCaptainConnected] = useState(false)
    const [ride, setRide] = useState(state?.ride || null)
    const [location, setLocation] = useState(null)
    const [locationError, setLocationError] = useState("")
    const [loadError, setLoadError] = useState("")
    const [finishRidePanel, setFinishRidePanel] = useState(false)
    const [isLoading, setIsLoading] = useState(!state?.ride)
    const finishRidePanelRef = useRef(null)
    const supportsGeolocation = typeof navigator !== "undefined" && Boolean(navigator.geolocation)

    useEffect(() => {
        if (!ride) {
            const loadActiveRide = async () => {
                try {
                    const token = localStorage.getItem("token")
                    const response = await axios.get(
                        `${import.meta.env.VITE_BASE_URL || "http://localhost:3000"}/rides/active/captain`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                    if (response.data.ride) {
                        setRide(response.data.ride)
                    } else {
                        setLoadError("You do not have an active ride.")
                    }
                } catch (error) {
                    console.error("Could not load active captain ride:", error.response?.data || error)
                    setLoadError(error.response?.data?.message || "Could not load your active ride.")
                } finally {
                    setIsLoading(false)
                }
            }

            loadActiveRide()
        }
    }, [ride])

    useEffect(() => {
        if (!captain?._id) return
        const joinCaptain = () => sendMessage("join", { userId: captain._id, userType: "captain" })
        const unsubscribeConnect = receiveMessage("connect", joinCaptain)
        const unsubscribeJoinSuccess = receiveMessage("join:success", (data) => {
            if (data.userId === captain._id && data.userType === "captain") {
                setIsCaptainConnected(true)
                sendMessage("captain-availability", { userId: captain._id, isOnline: true })
            }
        })
        const unsubscribeDisconnect = receiveMessage("disconnect", () => {
            setIsCaptainConnected(false)
        })
        const unsubscribeRideCancelled = receiveMessage("ride-cancelled", ({ rideId }) => {
            if (rideId === ride?._id) {
                navigate("/captain-home", { replace: true })
            }
        })
        const unsubscribePaymentMethod = receiveMessage("payment-method-selected", ({ rideId, paymentMethod }) => {
            if (rideId === ride?._id) {
                setRide((currentRide) => currentRide
                    ? { ...currentRide, paymentMethod, paymentStatus: "pending" }
                    : currentRide)
            }
        })
        const unsubscribeLocation = receiveMessage("location:updated", ({ userId, location: updatedLocation }) => {
            if (userId === captain._id) {
                setLocation(updatedLocation)
                setLocationError("")
            }
        })
        const unsubscribeLocationError = receiveMessage("location:error", ({ message }) => {
            setLocationError(message || "Could not share your location.")
        })
        joinCaptain()

        return () => {
            unsubscribeConnect()
            unsubscribeJoinSuccess()
            unsubscribeDisconnect()
            unsubscribeRideCancelled()
            unsubscribePaymentMethod()
            unsubscribeLocation()
            unsubscribeLocationError()
        }
    }, [captain?._id, navigate, receiveMessage, ride?._id, sendMessage])

    useEffect(() => {
        if (!captain?._id || !isCaptainConnected || !supportsGeolocation) return
        const watchId = navigator.geolocation.watchPosition(
            ({ coords }) => sendMessage("update-location-captain", {
                userId: captain._id,
                location: { ltd: coords.latitude, lng: coords.longitude }
            }),
            (error) => {
                console.error("Could not read captain location during ride:", error)
                setLocationError("Allow location access to share your live position with the rider.")
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
        )
        return () => navigator.geolocation.clearWatch(watchId)
    }, [captain?._id, isCaptainConnected, sendMessage, supportsGeolocation])

    useGSAP(() => {
        gsap.to(finishRidePanelRef.current, {
            transform: finishRidePanel ? "translateY(0)" : "translateY(100%)"
        })
    }, [finishRidePanel])

    const completeRide = () => {
        setFinishRidePanel(false)
        navigate("/captain-home", { replace: true })
    }

    const destinationMapUrl = ride?.destination
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ride.destination)}`
        : null

    if (isLoading) {
        return <div className="p-6">Loading your active ride…</div>
    }

    if (loadError || !ride) {
        return (
            <div className="min-h-screen p-6">
                <p role="alert" className="mb-4 text-red-600">{loadError || "Ride not found."}</p>
                <Link to="/captain-home" className="font-semibold underline">Back to captain home</Link>
            </div>
        )
    }

    return (
        <div className="h-screen">
            <div className="fixed p-6 top-0 flex items-center justify-between w-full z-[1]">
                <img className="w-16" src={logo} alt="Uber" />
                <Link to="/captain/logout" className="h-10 w-10 bg-white flex items-center justify-center rounded-full" aria-label="Log out">
                    <i className="text-large font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>
            <div className="h-4/5">
                <img className="h-full w-full object-cover" src="https://www.hanbit.co.kr/data/editor/20210429161116_qvzgnfvw.gif" alt="" />
                {location && (
                    <div className="absolute top-24 left-4 rounded-lg bg-white px-3 py-2 text-sm shadow">
                        Your live location: {location.ltd.toFixed(5)}, {location.lng.toFixed(5)}
                    </div>
                )}
                {locationError && (
                    <p role="alert" className="absolute top-24 left-4 rounded-lg bg-white px-3 py-2 text-sm text-red-600 shadow">
                        {locationError}
                    </p>
                )}
            </div>
            <div className="h-1/5 w-full p-6 flex items-center justify-between bg-yellow-400 relative">
                <span className="p-1 text-center w-[95%] top-0 absolute" aria-hidden="true">
                    <i className="text-3xl text-gray-700 ri-arrow-up-wide-line"></i>
                </span>
                <div className="text-sm font-semibold">
                    {destinationMapUrl ? (
                        <a href={destinationMapUrl} target="_blank" rel="noreferrer" className="underline">
                            Open destination in Maps
                        </a>
                    ) : "Ride in progress"}
                    <span className="mt-1 block font-normal">{ride.destination}</span>
                </div>
                <button
                    type="button"
                    onClick={() => setFinishRidePanel(true)}
                    className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white"
                >
                    Complete Ride
                </button>
            </div>
            <div ref={finishRidePanelRef} className="fixed w-full h-screen translate-y-full z-10 bottom-0 bg-white px-3 py-10 pt-12">
                <FinishRide
                    ride={ride}
                    setFinishRidePanel={setFinishRidePanel}
                    onComplete={completeRide}
                />
            </div>
        </div>
    )
}

export default CaptianRiding
