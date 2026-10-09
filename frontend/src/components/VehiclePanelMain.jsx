import { useState } from 'react'

const VehiclePanelMain = (props) => {
    const [selectedVehicle, setSelectedVehicle] = useState("UberGo")

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle)
        props.setVehiclePanel(false)
        props.setConfirmRidePanel(true)
    }

    return (
        <div>
            <h5 className="p-1 text-center w-[93%] top-0 absolute" onClick={() => {
                props.setVehiclePanel(false)
            }}><i className="text-3xl text-gray-500 ri-arrow-down-wide-line"></i></h5>
            <h2 className="text-2xl font-semibold mb-5">Choose a vehicle</h2>
            <div onClick={() => handleVehicleSelect("UberGo")} className={`flex border-2 ${selectedVehicle === "UberGo" ? "border-black" : "border-gray-100"} bg-gray-100 mb-2 rounded-xl w-full p-3 items-center justify-between`}>
                <img className="h-12" src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=368/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy9lN2U4NjFhOC0zMGVjLTRkNTctODA0NS03MTg2ZjZjNWVjMzUucG5n" alt="" />
                <div className="ml-2 w-1/2">
                    <h4 className="font-medium text-base">UberGo <span><i className="ri-user-3-fill"></i>4</span></h4>
                    <h5 className="font-medium text-base">2 mins away</h5>
                    <p className="font-normal text-xs text-gray-600">Affordable,compact rides</p>
                </div>
                <h2 className="text-lg font-semibold">₹193.20</h2>
            </div>
            <div onClick={() => handleVehicleSelect("Moto")} className={`flex border-2 ${selectedVehicle === "Moto" ? "border-black" : "border-gray-100"} mb-2 rounded-xl w-full p-3 items-center justify-between`}>
                <img className="h-11" src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=956/height=538/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy85MjAwMTg5YS03MWMwLTRmNmQtYTlkZS0xYjZhODUyMzkwNzkucG5n" alt="" />
                <div className="ml-2 w-1/2">
                    <h4 className="font-medium text-base">Moto <span><i className="ri-user-3-fill"></i>1</span></h4>
                    <h5 className="font-medium text-base">3 mins away</h5>
                    <p className="font-normal text-xs text-gray-600">Affordable,motocycle ride</p>
                </div>
                <h2 className="text-lg font-semibold">₹65.20</h2>
            </div>
            <div onClick={() => handleVehicleSelect("UberAuto")} className={`flex border-2 ${selectedVehicle === "UberAuto" ? "border-black" : "border-gray-100"} mb-2 rounded-xl w-full p-3 items-center justify-between`}>
                <img className="h-11" src="https://clipart-library.com/2023/Uber_Auto_312x208_pixels_Mobile.png" alt="" />
                <div className="ml-2 w-1/2">
                    <h4 className="font-medium text-base">UberAuto <span><i className="ri-user-3-fill"></i>1</span></h4>
                    <h5 className="font-medium text-base">3 mins away</h5>
                    <p className="font-normal text-xs text-gray-600">Affordable,Auto ride</p>
                </div>
                <h2 className="text-lg font-semibold">₹118.36</h2>
            </div>
        </div>
    )
}

export default VehiclePanelMain;