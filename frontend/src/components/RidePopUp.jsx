const RidePopUp = (props) => {
    return (
        <div>
            <h5 className="p-1 text-center w-[93%] top-0 absolute" onClick={() => {
                props.setRidePopUpPanel(false)
            }}><i className="text-3xl text-gray-500 ri-arrow-down-wide-line"></i></h5>
            <h2 className="text-2xl font-semibold mb-5">New Ride Available</h2>
            <div className="flex items-center justify-between bg-yellow-400 rounded-lg mt-4">
                <div className="flex items-center gap-3 m-2">
                    <img className="h-11 w-9 object-cover rounded-2xl" src="https://thumbs.dreamstime.com/b/male-eyewear-portrait-young-european-man-eyeglasses-looking-to-camera-isolated-white-studio-shot-264032230.jpg" alt="" />
                    <h2 className="text-lg font-medium ">Rajesh</h2>
                </div>
                <h5 className="text-lg font-semibold mr-2">2.2 KM</h5>
            </div>
            <div className="flex gap-2 flex-col ">
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
            <div className="flex w-full items-center justify-between">
                <button onClick={() => {
                    props.setRidePopUpPanel(false)
                }} className="mt-1 bg-gray-300 text-gray-700 font-semibold p-3 px-10 rounded-lg">Ignore</button>
                <button onClick={() => {
                    props.setRidePopUpPanel(false)
                    props.setConfirmRidePopUpPanel(true)
                }} className="mt-1 bg-green-600 text-white font-semibold p-3 px-10 rounded-lg">Accept</button>
            </div>
        </div>
    )
}

export default RidePopUp