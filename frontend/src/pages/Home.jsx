import { useRef, useState } from "react";
import logo from "../assets/uberlogo.png"
import { useGSAP } from "@gsap/react"
import gsap from "gsap";
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from "../components/LocationSearchPanel";
import VehiclePanelMain from "../components/VehiclePanelMain";
import ConfirmedRide from "../components/ConfirmedRide";
import LookingForDriver from "../components/LookingForDriver";
import WaitingForDriver from "../components/WaitingForDriver";

const Home = () => {

  const [pickUp, setPickUp] = useState("");
  const [destination, setDestination] = useState("")
  const [panelOpen, setPanelOpen] = useState(false)
  const panelRef = useRef(null)
  const panelCloseRef = useRef(null)
  const vehiclePanelRef = useRef(null)
  const confirmRidePanelRef = useRef(null)
  const vehicleFoundRef= useRef(null)
  const waitingForDriverRef= useRef(null)
  const [confirmRidePanel,setConfirmRidePanel] = useState(false)
  const [vehiclePanel,setVehiclePanel] = useState(false)
  const [vehicleFound,setVehicleFound] = useState(false);
  const [waitingForDriver,setWaitingForDriver] = useState(false)

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

  useGSAP(function(){
    if(vehiclePanel){
      gsap.to(vehiclePanelRef.current,{
        transform:'translateY(0)'
      })
    }
    else{
      gsap.to(vehiclePanelRef.current,{
        transform:'translateY(100%)'
      })
    }
  },[vehiclePanel])

  useGSAP(function(){
    if(confirmRidePanel){
      gsap.to(confirmRidePanelRef.current,{
        transform:'translateY(0)'
      })
    }
    else{
      gsap.to(confirmRidePanelRef.current,{
        transform:'translateY(100%)'
      })
    }
  },[confirmRidePanel])

  useGSAP(function(){
    if(vehicleFound){
      gsap.to(vehicleFoundRef.current,{
        transform:'translateY(0)'
      })
    }
    else{
      gsap.to(vehicleFoundRef.current,{
        transform:'translateY(100%)'
      })
    }
  },[vehicleFound])

  useGSAP(function(){
    if(waitingForDriver){
      gsap.to(waitingForDriverRef.current,{
        transform:'translateY(0)'
      })
    }
    else{
      gsap.to(waitingForDriverRef.current,{
        transform:'translateY(100%)'
      })
    }
  },[waitingForDriver])

  return (
    <div className="h-screen relative overflow-hidden">
      <img className="w-16 absolute left-5 top-5" src={logo} alt="" />
      <div className="h-screen w-screen">
        {/* image for temporary use */}
        <img className="h-full w-full object-cover" src="https://www.hanbit.co.kr/data/editor/20210429161116_qvzgnfvw.gif" alt="" />
      </div>
      <div className="h-screen flex flex-col justify-end absolute top-0 w-full">
        <div className="h-[30%] p-6 bg-white relative">
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
              onClick={() => {
                setPanelOpen(true)
              }}
              value={pickUp}
              onChange={(e) => {
                setPickUp(e.target.value)
              }}
              className="bg-[#eee] px-12 py-2 text-base rounded-lg w-full mt-5"
              type="text"
              placeholder="Add a pick-up location" />
            <input
              onClick={() => {
                setPanelOpen(true)
              }}
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value)
              }}
              className="bg-[#eee] px-12 py-2 text-base rounded-lg w-full mt-5"
              type="text"
              placeholder="Enter your destination" />
          </form>
        </div>
        <div ref={panelRef} className="h-0 bg-white">
          <LocationSearchPanel setPanelOpen={setPanelOpen} setVehiclePanel={setVehiclePanel}/>
        </div>
      </div>
      <div ref={vehiclePanelRef} className="fixed w-full z-10 bottom-0 translate-y-full px-3 py-6 bg-white pt-12">
        <VehiclePanelMain setConfirmRidePanel={setConfirmRidePanel} setVehiclePanel={setVehiclePanel} />
      </div>
      <div ref={confirmRidePanelRef} className="fixed w-full z-10 bottom-0 translate-y-full px-3 py-6 bg-white pt-12">
        <ConfirmedRide setConfirmRidePanel={setConfirmRidePanel} setVehicleFound={setVehicleFound} />
      </div>
      <div ref={vehicleFoundRef} className="fixed w-full z-10 bottom-0 translate-y-full px-3 py-6 bg-white pt-12">
        <LookingForDriver setVehicleFound={setVehicleFound} setWaitingForDriver={setWaitingForDriver} />
      </div>
      <div ref={waitingForDriverRef} className="fixed w-full z-10 bottom-0 translate-y-full px-3 py-6 bg-white pt-12">
        <WaitingForDriver setWaitingForDriver={setWaitingForDriver} />
      </div>
    </div>
  )
}

export default Home