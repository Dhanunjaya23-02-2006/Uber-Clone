const ConfirmedRide = (props) => {
  return (
    <div>
      <h5 className="p-1 text-center w-[93%] top-0 absolute" onClick={() => {
        props.setConfirmRidePanel(false)
      }}><i className="text-3xl text-gray-500 ri-arrow-down-wide-line"></i></h5>
      <h2 className="text-2xl font-semibold mb-5">Confirm your Ride</h2>
      <div className="flex gap-2 justify-between flex-col items-center">
        <img className="h-25" src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=368/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy9lN2U4NjFhOC0zMGVjLTRkNTctODA0NS03MTg2ZjZjNWVjMzUucG5n" alt="" />
        <div className="w-full mt-5">
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <h3 className="text-mg font-medium">65-A/2,madhapur</h3>
              <p className="text-sm mt-1 text-gray-600">AyyapaSociety,Hyderabad</p>
            </div>
          </div>
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <h3 className="text-mg font-medium">91,Road No:3,Siddiq Nagar</h3>
              <p className="text-sm mt-1 text-gray-600">Gachibowli,Hyderabad</p>
            </div>
          </div>
          <div className="flex items-center gap-5 p-3">
            <i className="text-lg ri-currency-line"></i>
            <div>
              <h3 className="text-mg font-medium">₹193.20</h3>
              <p className="text-sm mt-1 text-gray-600">Cash Cash</p>
            </div>
          </div>
        </div>
        <button onClick={()=>{
          props.setVehicleFound(true)
          props.setConfirmRidePanel(false)
        }} className="w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg">Confirm</button>
      </div>
    </div>
  )
}

export default ConfirmedRide