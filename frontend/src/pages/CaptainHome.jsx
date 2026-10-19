import { Link, useNavigate } from "react-router-dom"
import logo from "../assets/uberlogo.png"
import CaptainDetails from "../components/CaptainDetails"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import RidePopUp from "../components/RidePopUp";
import ConfirmRidePopUp from "../components/ConfirmRidePopUp"
import { useContext } from "react";
import SocketContext from "../context/SocketContext";
import { CaptainDataContext } from "../context/CaptianContext";
import axios from "axios";

const CaptainHome = () => {
  const supportsGeolocation = typeof navigator !== "undefined" && Boolean(navigator.geolocation)
  const { sendMessage, receiveMessage } = useContext(SocketContext)
  const { captain, setCaptain } = useContext(CaptainDataContext)
  const navigate = useNavigate()

  const [ridePopUpPanel, setRidePopUpPanel] = useState(false);
  const ridePopUpPanelRef = useRef(null);
  const [confirmRidePopUpPanel,setConfirmRidePopUpPanel]=useState(false)
  const confirmRidePopUpPanelRef = useRef(null)
  const [activeRide, setActiveRide] = useState(null)
  const [isCaptainConnected, setIsCaptainConnected] = useState(false)
  const [isOnline, setIsOnline] = useState(captain?.status === "active")
  const [onlineRequested, setOnlineRequested] = useState(captain?.status === "active")
  const [isGoingOnline, setIsGoingOnline] = useState(false)
  const [captainLocation, setCaptainLocation] = useState(null)
  const [locationError, setLocationError] = useState("")

  useEffect(() => {
    if (!captain?._id) return

    const unsubscribeJoinSuccess = receiveMessage("join:success", (data) => {
      if (data.userId === captain._id && data.userType === "captain") {
        setIsCaptainConnected(true)
        setLocationError("")
        const online = data.status === "active" && supportsGeolocation
        setIsOnline(online)
        setOnlineRequested(online)
        setIsGoingOnline(false)
        if (data.status === "active" && !supportsGeolocation) {
          setLocationError("This browser does not support location sharing.")
          sendMessage("captain-availability", { userId: captain._id, isOnline: false })
        }
        setCaptain((currentCaptain) => currentCaptain
          ? { ...currentCaptain, status: online ? "active" : "inactive" }
          : currentCaptain)
      }
    })
    const unsubscribeJoinError = receiveMessage("join:error", ({ message }) => {
      setLocationError(message || "Could not connect your captain account.")
    })
    const registerCaptain = () => {
      sendMessage("join", { userId: captain._id, userType: "captain" })
    }
    const unsubscribeConnect = receiveMessage("connect", registerCaptain)
    const unsubscribeDisconnect = receiveMessage("disconnect", () => {
      setIsCaptainConnected(false)
      setCaptainLocation(null)
      setIsOnline(false)
      setIsGoingOnline(false)
    })

    registerCaptain()
    return () => {
      unsubscribeJoinSuccess()
      unsubscribeJoinError()
      unsubscribeConnect()
      unsubscribeDisconnect()
      setIsCaptainConnected(false)
    }
  }, [sendMessage, receiveMessage, captain?._id, setCaptain, supportsGeolocation])

  useEffect(() => {
    if (!captain?._id || !isCaptainConnected || !onlineRequested) return
    if (!supportsGeolocation) return

    const unsubscribeLocation = receiveMessage("location:updated", ({ userId, location }) => {
      if (userId === captain._id) {
        setCaptainLocation(location)
        setLocationError("")
        setIsOnline(true)
        setIsGoingOnline(false)
        setCaptain((currentCaptain) => currentCaptain
          ? { ...currentCaptain, status: "active", location }
          : currentCaptain)
      }
    })
    const unsubscribeLocationError = receiveMessage("location:error", ({ message }) => {
      setLocationError(message || "Your location could not be shared.")
      setOnlineRequested(false)
      setIsOnline(false)
      setIsGoingOnline(false)
    })
    const unsubscribeAvailability = receiveMessage("availability:updated", ({ userId, isOnline: available, awaitingLocation }) => {
      if (userId !== captain._id) return
      if (available) {
        setIsOnline(true)
        setIsGoingOnline(false)
        setCaptain((currentCaptain) => currentCaptain
          ? { ...currentCaptain, status: "active" }
          : currentCaptain)
      } else if (!awaitingLocation) {
        setIsOnline(false)
        setIsGoingOnline(false)
        setCaptain((currentCaptain) => currentCaptain
          ? { ...currentCaptain, status: "inactive" }
          : currentCaptain)
      }
    })
    const unsubscribeAvailabilityError = receiveMessage("availability:error", ({ message }) => {
      setLocationError(message || "Could not update your online status.")
      setOnlineRequested(false)
      setIsOnline(false)
      setIsGoingOnline(false)
    })
    sendMessage("captain-availability", { userId: captain._id, isOnline: true })
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        sendMessage("update-location-captain", {
          userId: captain._id,
          location: {
            ltd: coords.latitude,
            lng: coords.longitude
          }
        })
      },
      (error) => {
        console.error("Could not read captain location:", error)
        sendMessage("captain-availability", { userId: captain._id, isOnline: false })
        setOnlineRequested(false)
        setIsOnline(false)
        setIsGoingOnline(false)
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Location permission is disabled. Enable it to receive nearby rides."
            : "Could not get your location. Check your device location settings."
        )
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
      unsubscribeLocation()
      unsubscribeLocationError()
      unsubscribeAvailability()
      unsubscribeAvailabilityError()
    }
  }, [sendMessage, receiveMessage, captain?._id, isCaptainConnected, onlineRequested, supportsGeolocation, setCaptain])

  useEffect(() => {
    if (!captain?._id) return
    let isMounted = true
    const loadActiveRide = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL || "http://localhost:3000"}/rides/active/captain`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!isMounted || !response.data.ride) return

        const ride = response.data.ride
        if (ride.status === "ongoing") {
          navigate("/captain-riding", { replace: true, state: { ride } })
          return
        }

        setActiveRide(ride)
        setConfirmRidePopUpPanel(true)
      } catch (error) {
        console.error("Could not restore active captain ride:", error.response?.data || error)
      }
    }

    loadActiveRide()
    return () => { isMounted = false }
  }, [captain?._id, navigate])

  useEffect(() => {
    return receiveMessage("new-ride", (ride) => {
      if (!isOnline || activeRide) return
      console.info("New ride available:", ride._id)
      setActiveRide((currentRide) => currentRide || ride)
      setRidePopUpPanel(true)
    })
  }, [activeRide, isOnline, receiveMessage])

  useEffect(() => {
    return receiveMessage("ride-cancelled", ({ rideId }) => {
      if (rideId === activeRide?._id) {
        setActiveRide(null)
        setRidePopUpPanel(false)
        setConfirmRidePopUpPanel(false)
      }
    })
  }, [activeRide?._id, receiveMessage])

  const toggleAvailability = () => {
    if (!isCaptainConnected) {
      setLocationError("Connecting to the server. Try going online again in a moment.")
      return
    }

    if (onlineRequested) {
      setOnlineRequested(false)
      setIsOnline(false)
      setIsGoingOnline(false)
      setLocationError("")
      if (activeRide?.status !== "accepted") {
        setActiveRide(null)
        setRidePopUpPanel(false)
        setConfirmRidePopUpPanel(false)
      }
      setCaptain((currentCaptain) => currentCaptain
        ? { ...currentCaptain, status: "inactive" }
        : currentCaptain)
      sendMessage("captain-availability", { userId: captain._id, isOnline: false })
      return
    }

    if (!supportsGeolocation) {
      setLocationError("This browser does not support location sharing.")
      return
    }

    setLocationError("")
    setIsGoingOnline(true)
    setOnlineRequested(true)
  }

  useGSAP(function () {
    if (ridePopUpPanel) {
      gsap.to(ridePopUpPanelRef.current, {
        transform: 'translateY(0)'
      })
    }
    else{
      gsap.to(ridePopUpPanelRef.current,{
        transform: 'translateY(100%)'
      })
    }
  },[ridePopUpPanel])

  useGSAP(function () {
    if (confirmRidePopUpPanel) {
      gsap.to(confirmRidePopUpPanelRef.current, {
        transform: 'translateY(0)'
      })
    }
    else{
      gsap.to(confirmRidePopUpPanelRef.current,{
        transform: 'translateY(100%)'
      })
    }
  },[confirmRidePopUpPanel])

  return (
    <div className="h-screen">
      <div className="fixed p-6 top-0 flex items-center justify-between w-full">
        <img className="w-16" src={logo} alt="" />
        <Link to={'/captain/logout'} className="h-10 w-10 bg-white flex items-center justify-center rounded-full">
          <i className="text-large font-medium ri-logout-box-r-line"></i>
        </Link>
      </div>
      <div className="absolute top-20 left-4 right-4 z-[1] flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm shadow">
        <div className="min-w-0">
          <p className={isOnline ? "font-semibold text-green-700" : "font-semibold text-gray-700"}>
            {isOnline ? "You are online" : isGoingOnline ? "Getting your location…" : "You are offline"}
          </p>
          {locationError ? (
            <p role="alert" className="mt-1 text-xs text-red-600">{locationError}</p>
          ) : captainLocation && isOnline ? (
            <p className="mt-1 text-xs text-gray-600">
              {captainLocation.ltd.toFixed(5)}, {captainLocation.lng.toFixed(5)}
            </p>
          ) : !isCaptainConnected ? (
            <p className="mt-1 text-xs text-gray-600">Connecting to ride service…</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={toggleAvailability}
          disabled={
            !isCaptainConnected ||
            isGoingOnline ||
            (isOnline && ["accepted", "ongoing"].includes(activeRide?.status))
          }
          className={`shrink-0 rounded-full px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${isOnline ? "bg-red-600" : "bg-green-600"}`}
        >
          {isGoingOnline ? "Going online…" : isOnline ? "Go offline" : "Go online"}
        </button>
      </div>
      <div className="h-2/3">
        <img className="h-full w-full object-cover" src="https://www.hanbit.co.kr/data/editor/20210429161116_qvzgnfvw.gif" alt="" />
      </div>
      <div>
        <CaptainDetails />
      </div>
      <div ref={ridePopUpPanelRef} className="fixed w-full translate-y-full z-10 bottom-0 bg-white px-3 py-10 pt-12">
        <RidePopUp
          ride={activeRide}
          setRidePopUpPanel={setRidePopUpPanel}
          setConfirmRidePopUpPanel={setConfirmRidePopUpPanel}
        />
      </div>
      <div ref={confirmRidePopUpPanelRef} className="fixed w-full h-screen translate-y-full z-10 bottom-0 bg-white px-3 py-10 pt-12">
        <ConfirmRidePopUp
          key={activeRide?._id || "no-ride"}
          ride={activeRide}
          onAccepted={setActiveRide}
          setConfirmRidePopUpPanel={setConfirmRidePopUpPanel}
          setRidePopUpPanel={setRidePopUpPanel}
        />
      </div>
    </div>
  )
}

export default CaptainHome