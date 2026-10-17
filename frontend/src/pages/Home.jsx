import { useEffect, useRef, useState } from "react";
import axios from "axios";
import logo from "../assets/uberlogo.png"
import { useGSAP } from "@gsap/react"
import gsap from "gsap";
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from "../components/LocationSearchPanel";
import VehiclePanelMain from "../components/VehiclePanelMain";
import ConfirmedRide from "../components/ConfirmedRide";
import LookingForDriver from "../components/LookingForDriver";
import WaitingForDriver from "../components/WaitingForDriver";
import SocketContext from "../context/SocketContext";
import { useContext } from "react";
import { UserDataContext } from "../context/UserContext";

const vehicleTypeMap = {
  UberGo: "car",
  Moto: "moto",
  UberAuto: "auto"
}

const Home = () => {

  const [pickUp, setPickUp] = useState("");
  const [destination, setDestination] = useState("")
  const [panelOpen, setPanelOpen] = useState(false)
  const [activeField, setActiveField] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionsError, setSuggestionsError] = useState("")
  const panelRef = useRef(null)
  const panelCloseRef = useRef(null)
  const vehiclePanelRef = useRef(null)
  const confirmRidePanelRef = useRef(null)
  const vehicleFoundRef = useRef(null)
  const waitingForDriverRef = useRef(null)
  const [confirmRidePanel, setConfirmRidePanel] = useState(false)
  const [vehiclePanel, setVehiclePanel] = useState(false)
  const [vehicleFound, setVehicleFound] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(false)
  const [fare, setFare] = useState(null)
  const [fareError, setFareError] = useState("")
  const [vehicleType, setVehicleType] = useState(null);

  const { sendMessage } = useContext(SocketContext)
  const { user } = useContext(UserDataContext)

  useEffect(() => {
    if (user?._id) {
      sendMessage("join", { userType: "user", userId: user._id })
    }
  }, [sendMessage, user?._id])

  const searchQuery = activeField === "pickup"
    ? pickUp
    : activeField === "destination"
      ? destination
      : ""

  useEffect(() => {
    const input = searchQuery.trim()

    if (input.length < 3) {
      return
    }

    const controller = new AbortController()

    const timeoutId = window.setTimeout(async () => {
      setSuggestionsLoading(true)
      setSuggestionsError("")

      try {
        const token = localStorage.getItem("token")
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
          {
            params: { input },
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        )

        if (!Array.isArray(response.data)) {
          throw new Error("The location service returned an invalid response.")
        }

        setSuggestions(response.data)
      } catch (error) {
        if (axios.isCancel(error)) {
          return
        }

        console.error("Failed to fetch location suggestions:", error)
        setSuggestionsError(
          error.response?.data?.message ||
          "Could not load location suggestions. Please try again."
        )
      } finally {
        if (!controller.signal.aborted) {
          setSuggestionsLoading(false)
        }
      }
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [activeField, searchQuery])

  const activateSearchField = (field) => {
    setActiveField(field)
    setSuggestions([])
    setSuggestionsLoading(false)
    setSuggestionsError("")
    setPanelOpen(true)
  }

  const selectSuggestion = (suggestion) => {
    if (activeField === "pickup") {
      setPickUp(suggestion)
    } else if (activeField === "destination") {
      setDestination(suggestion)
    }

    setSuggestions([])
    setSuggestionsLoading(false)
    setActiveField(null)
  }

  const submitHandler = (e) => {
    e.preventDefault();
  }

  useGSAP(function () {
    if (panelOpen) {
      gsap.to(panelRef.current, {
        height: '70%',
        padding: 24
      })
      gsap.to(panelCloseRef.current, {
        opacity: 1
      })
    }
    else {
      gsap.to(panelRef.current, {
        height: '0%',
        padding: 0
      })
      gsap.to(panelCloseRef.current, {
        opacity: 0
      })
    }
  }, [panelOpen])

  useGSAP(function () {
    if (vehiclePanel) {
      gsap.to(vehiclePanelRef.current, {
        transform: 'translateY(0)',
        autoAlpha: 1
      })
    }
    else {
      gsap.to(vehiclePanelRef.current, {
        transform: 'translateY(100%)',
        autoAlpha: 0
      })
    }
  }, [vehiclePanel])

  useGSAP(function () {
    if (confirmRidePanel) {
      gsap.to(confirmRidePanelRef.current, {
        transform: 'translateY(0)',
        autoAlpha: 1
      })
    }
    else {
      gsap.to(confirmRidePanelRef.current, {
        transform: 'translateY(100%)',
        autoAlpha: 0
      })
    }
  }, [confirmRidePanel])

  useGSAP(function () {
    if (vehicleFound) {
      gsap.to(vehicleFoundRef.current, {
        transform: 'translateY(0)',
        autoAlpha: 1
      })
    }
    else {
      gsap.to(vehicleFoundRef.current, {
        transform: 'translateY(100%)',
        autoAlpha: 0
      })
    }
  }, [vehicleFound])

  useGSAP(function () {
    if (waitingForDriver) {
      gsap.to(waitingForDriverRef.current, {
        transform: 'translateY(0)',
        autoAlpha: 1
      })
    }
    else {
      gsap.to(waitingForDriverRef.current, {
        transform: 'translateY(100%)',
        autoAlpha: 0
      })
    }
  }, [waitingForDriver])

  async function findTrip() {
    if (pickUp.trim().length < 3 || destination.trim().length < 3) {
      setFareError("Enter a pickup and destination with at least 3 characters.")
      return
    }

    setFareError("")
    setPanelOpen(false)

    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
        params: { pickup: pickUp, destination },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      setFare(response.data)
      setVehiclePanel(true)
    } catch (error) {
      console.error("Failed to fetch ride fares:", error)
      setFareError(
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Could not calculate fares. Please check the locations and try again."
      )
    }
  }

  async function createRide() {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/create`, {
        pickup: pickUp,
        destination,
        vehicleType: vehicleTypeMap[vehicleType] || vehicleType
      },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

      console.log("Ride created:", response.data)
      return true
    } catch (error) {
      console.error("Failed to create ride:", error.response?.data || error.message)
      return false
    }
  }

  return (
    <div className="h-screen relative overflow-hidden">
      <img className="w-16 absolute left-5 top-5" src={logo} alt="" />
      <div className="h-screen w-screen">
        {/* image for temporary use */}
        <img className="h-full w-full object-cover" src="https://www.hanbit.co.kr/data/editor/20210429161116_qvzgnfvw.gif" alt="" />
      </div>
      <div className="h-screen flex flex-col justify-end absolute top-0 w-full">
        <div className="h-[35%] p-6 bg-white relative">
          <h5 ref={panelCloseRef} onClick={() => {
            setPanelOpen(false)
          }} className="absolute opacity-0 right-6 top-6 text-2xl">
            <i className="ri-arrow-down-wide-fill"></i>
          </h5>
          <h4 className="text-2xl font-semibold">Find a trip</h4>
          <form onSubmit={(e) => {
            submitHandler(e);
          }}>
            <div className="line absolute h-16 w-1 top-[45%] left-10 bg-gray-900 rounded-full"></div>
            <input
              onFocus={() => {
                activateSearchField("pickup")
              }}
              value={pickUp}
              onChange={(e) => {
                setSuggestions([])
                setSuggestionsLoading(false)
                setSuggestionsError("")
                setPickUp(e.target.value)
              }}
              className="bg-[#eee] px-12 py-2 text-base rounded-lg w-full mt-5"
              type="text"
              placeholder="Add a pick-up location" />
            <input
              onFocus={() => {
                activateSearchField("destination")
              }}
              value={destination}
              onChange={(e) => {
                setSuggestions([])
                setSuggestionsLoading(false)
                setSuggestionsError("")
                setDestination(e.target.value)
              }}
              className="bg-[#eee] px-12 py-2 text-base rounded-lg w-full mt-5"
              type="text"
              placeholder="Enter your destination" />
          </form>
          {fareError && <p role="alert" className="mt-2 text-sm text-red-600">{fareError}</p>}
          <button onClick={findTrip} className="bg-black h-[20%] mt-2 w-full rounded-lg text-white">Find Trip</button>
        </div>
        <div ref={panelRef} className="h-0 bg-white">
          <LocationSearchPanel
            suggestions={suggestions}
            isLoading={suggestionsLoading}
            error={suggestionsError}
            onSelectSuggestion={selectSuggestion}
          />
        </div>
      </div>
      <div ref={vehiclePanelRef} className="fixed w-full z-10 bottom-0 translate-y-full px-3 py-6 bg-white pt-12">
        <VehiclePanelMain
          selectVehicle={setVehicleType} fare={fare} setConfirmRidePanel={setConfirmRidePanel} setVehiclePanel={setVehiclePanel} />
      </div>
      <div ref={confirmRidePanelRef} className="fixed w-full z-10 bottom-0 translate-y-full px-3 py-6 bg-white pt-12">
        <ConfirmedRide
          createRide={createRide}
          pickup={pickUp}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          setConfirmRidePanel={setConfirmRidePanel} setVehicleFound={setVehicleFound} />
      </div>
      <div ref={vehicleFoundRef} className="fixed w-full z-10 bottom-0 translate-y-full px-3 py-6 bg-white pt-12">
        <LookingForDriver
          createRide={createRide}
          pickup={pickUp}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          setVehicleFound={setVehicleFound} setWaitingForDriver={setWaitingForDriver} />
      </div>
      <div ref={waitingForDriverRef} className="fixed w-full z-10 bottom-0 translate-y-full px-3 py-6 bg-white pt-12">
        <WaitingForDriver setWaitingForDriver={setWaitingForDriver} />
      </div>
    </div>
  )
}

export default Home