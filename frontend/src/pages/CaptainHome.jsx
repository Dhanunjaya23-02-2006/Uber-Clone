import { Link } from "react-router-dom"
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

const CaptainHome = () => {

  const [ridePopUpPanel, setRidePopUpPanel] = useState(true);
  const ridePopUpPanelRef = useRef(null);
  const [confirmRidePopUpPanel,setConfirmRidePopUpPanel]=useState(false)
  const confirmRidePopUpPanelRef = useRef(null)

  const { sendMessage } = useContext(SocketContext)
  const { captain } = useContext(CaptainDataContext)

  useEffect(() => {
    if (captain?._id) {
      sendMessage("join", {
        userId: captain._id,
        userType: "captain"
      })
    }
  }, [sendMessage, captain?._id])

  useEffect(() => {
    if (!captain?._id || !navigator.geolocation) return

    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        sendMessage("update-location-captain", {
          userId: captain._id,
          location: {
            ltd: coords.latitude,
            lng: coords.longitude
          }
        })
      })
    }, 10000)

    return () => clearInterval(intervalId)
  }, [sendMessage, captain?._id])

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
        <Link to={'/captain-login'} className="h-10 w-10 bg-white flex items-center justify-center rounded-full">
          <i className="text-large font-medium ri-logout-box-r-line"></i>
        </Link>
      </div>
      <div className="h-2/3">
        <img className="h-full w-full object-cover" src="https://www.hanbit.co.kr/data/editor/20210429161116_qvzgnfvw.gif" alt="" />
      </div>
      <div>
        <CaptainDetails />
      </div>
      <div ref={ridePopUpPanelRef} className="fixed w-full translate-y-full z-10 bottom-0 bg-white px-3 py-10 pt-12">
        <RidePopUp setRidePopUpPanel={setRidePopUpPanel} setConfirmRidePopUpPanel={setConfirmRidePopUpPanel} />
      </div>
      <div ref={confirmRidePopUpPanelRef} className="fixed w-full h-screen translate-y-full z-10 bottom-0 bg-white px-3 py-10 pt-12">
        <ConfirmRidePopUp setConfirmRidePopUpPanel={setConfirmRidePopUpPanel} setRidePopUpPanel={setRidePopUpPanel} />
      </div>
    </div>
  )
}

export default CaptainHome