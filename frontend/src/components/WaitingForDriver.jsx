import CaptainAvatar from "./CaptainAvatar"

const WaitingForDriver = ({ ride, setWaitingForDriver }) => {
  const captain = ride?.captain
  const captainName = [
    captain?.fullname?.firstname,
    captain?.fullname?.lastname
  ].filter(Boolean).join(" ")
  const vehicleType = captain?.vehicle?.vehicleType || "Vehicle"
  const captainLocation = captain?.location

  return (
    <div>
      <h5 className="p-1 text-center w-[93%] top-0 absolute" onClick={() => {
        setWaitingForDriver(false)
      }}><i className="text-3xl text-gray-500 ri-arrow-down-wide-line"></i></h5>
      <h2 className="text-2xl font-semibold mb-5">Your Driver Is Confirmed</h2>
      <div className="flex items-center justify-between border-b-2 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <CaptainAvatar captain={captain} />
          <div className="min-w-0">
            <h3 className="text-lg font-semibold">{captainName || "Captain"}</h3>
            <p className="text-sm text-gray-600 capitalize">{captain?.email || "Driver details confirmed"}</p>
          </div>
        </div>
        <div className="text-right">
          <h4 className="text-lg font-semibold uppercase">{captain?.vehicle?.plate || "Vehicle details unavailable"}</h4>
          <p className="text-sm text-gray-600 capitalize">
            {[captain?.vehicle?.colour, vehicleType].filter(Boolean).join(" ")}
          </p>
        </div>
      </div>
      <div className="w-full mt-3">
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
        <div className="flex items-center gap-5 p-3 border-b-2">
          <i className="text-lg ri-currency-line"></i>
          <div>
            <h3 className="font-medium">₹{ride?.fare ?? "—"}</h3>
            <p className="text-sm mt-1 text-gray-600">Cash</p>
          </div>
        </div>
        {Number.isFinite(captainLocation?.ltd) && Number.isFinite(captainLocation?.lng) && (
          <div className="flex items-center gap-5 p-3">
            <i className="text-lg ri-crosshair-2-line"></i>
            <div>
              <h3 className="font-medium">Driver location</h3>
              <p className="text-sm mt-1 text-gray-600">
                {captainLocation.ltd.toFixed(5)}, {captainLocation.lng.toFixed(5)}
              </p>
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => setWaitingForDriver(false)}
        className="w-full mt-3 bg-gray-200 text-gray-800 font-semibold p-2 rounded-lg"
      >
        Close
      </button>
    </div>
  )
}

export default WaitingForDriver
