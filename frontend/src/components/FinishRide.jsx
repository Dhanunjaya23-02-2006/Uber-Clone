import { Link } from "react-router-dom";

const FinishRide = (props) => {
  return (
    <div>
      <h5 className="p-1 text-center w-[93%] top-0 absolute" onClick={() => {
        props.setFinishRidePanel(false)
      }}><i className="text-3xl text-gray-500 ri-arrow-down-wide-line"></i></h5>
      <h2 className="text-2xl font-semibold mb-5">Finish this Ride</h2>
      <div className="flex items-center justify-between border-2 border-yellow-400 rounded-lg mt-4">
        <div className="flex items-center gap-3 m-2">
          <img className="h-11 w-9 object-cover rounded-2xl" src="https://thumbs.dreamstime.com/b/male-eyewear-portrait-young-european-man-eyeglasses-looking-to-camera-isolated-white-studio-shot-264032230.jpg" alt="" />
          <h2 className="text-lg font-medium ">Rajesh</h2>
        </div>
        <h5 className="text-lg font-semibold mr-2">2.2 KM</h5>
      </div>
      <div className="w-full flex flex-col">
        <div className="w-full flex items-center justify-start gap-5 p-3 border-b-2">
          <i className="text-lg ri-map-pin-2-fill"></i>
          <div>
            <h3 className="text-mg font-medium">65-A/2,madhapur</h3>
            <p className="text-sm mt-1 text-gray-600">AyyapaSociety,Hyderabad</p>
          </div>
        </div>
        <div className="w-full flex items-center justify-start gap-5 p-3 border-b-2">
          <i className="text-lg ri-map-pin-2-fill"></i>
          <div>
            <h3 className="text-mg font-medium">91,Road No:3,Siddiq Nagar</h3>
            <p className="text-sm mt-1 text-gray-600">Gachibowli,Hyderabad</p>
          </div>
        </div>
        <div className="w-full flex items-center justify-start gap-5 p-3 border-b-2">
          <i className="text-lg ri-currency-line"></i>
          <div>
            <h3 className="text-mg font-medium">₹193.20</h3>
            <p className="text-sm mt-1 text-gray-600">Cash Cash</p>
          </div>
        </div>
      </div>
      <div className="mt-8 w-full">
        <Link to={'/captain-home'} className="w-full mt-2 flex text-lg justify-center bg-green-600 text-white font-semibold p-3 rounded-lg">Finish Ride</Link>
        <p className="mt-8 text-sm">Click on finish ride button if you have completed the payment.</p>
      </div>
    </div>
  )
}

export default FinishRide