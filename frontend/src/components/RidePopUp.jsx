const RidePopUp = ({ ride, setRidePopUpPanel, setConfirmRidePopUpPanel }) => {
    const riderName = [
        ride?.user?.fullname?.firstname,
        ride?.user?.fullname?.lastname
    ].filter(Boolean).join(" ") || "Rider"

    return (
        <div>
            <h5 className="p-1 text-center w-[93%] top-0 absolute" onClick={() => {
                setRidePopUpPanel(false)
            }}><i className="text-3xl text-gray-500 ri-arrow-down-wide-line"></i></h5>
            <h2 className="text-2xl font-semibold mb-5">New Ride Available</h2>
            <div className="flex items-center justify-between bg-yellow-400 rounded-lg mt-4 p-3">
                <h2 className="text-lg font-medium">{riderName}</h2>
                <h5 className="text-lg font-semibold">₹{ride?.fare ?? "—"}</h5>
            </div>
            <div className="flex gap-2 flex-col">
                <div className="flex items-center gap-5 p-3 border-b-2">
                    <i className="text-lg ri-map-pin-2-fill"></i>
                    <div>
                        <h3 className="font-medium">Pickup</h3>
                        <p className="text-sm mt-1 text-gray-600">{ride?.pickup || "—"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-5 p-3 border-b-2">
                    <i className="text-lg ri-flag-fill"></i>
                    <div>
                        <h3 className="font-medium">Destination</h3>
                        <p className="text-sm mt-1 text-gray-600">{ride?.destination || "—"}</p>
                    </div>
                </div>
            </div>
            <div className="flex w-full items-center justify-between">
                <button onClick={() => {
                    setRidePopUpPanel(false)
                }} className="mt-1 bg-gray-300 text-gray-700 font-semibold p-3 px-10 rounded-lg">Ignore</button>
                <button onClick={() => {
                    setRidePopUpPanel(false)
                    setConfirmRidePopUpPanel(true)
                }} className="mt-1 bg-green-600 text-white font-semibold p-3 px-10 rounded-lg">Accept</button>
            </div>
        </div>
    )
}

export default RidePopUp
