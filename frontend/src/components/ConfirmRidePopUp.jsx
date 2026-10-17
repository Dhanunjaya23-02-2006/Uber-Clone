import { useState } from "react";
import { Link } from "react-router-dom"

const ConfirmRidePopUp = (props) => {

    const [otp, setOtp] = useState("")

    const submitHandler = (e) =>{
        e.preventDefault();
    }
    return (
        <div>
            <h5 className="p-1 text-center w-[93%] top-0 absolute" onClick={() => {
                props.setConfirmRidePopUpPanel(false)
                props.setRidePopUpPanel(true)
            }}><i className="text-3xl text-gray-500 ri-arrow-down-wide-line"></i></h5>
            <h2 className="text-2xl font-semibold mb-5">Confirm this ride to Start</h2>
            <div className="flex items-center justify-between border-2 border-yellow-400 bg-white rounded-lg mt-4">
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
            <div className="mt-6 w-full">
                <form onSubmit={(e)=>{
                    submitHandler(e);
                }}>
                    <input value={otp} onChange={(e)=>{
                        setOtp(e.target.value)
                    }} className="bg-[#eee] px-6 py-4 font-mono text-base rounded-lg w-full mt-5" type="text" placeholder="Enter OTP" />
                    <Link to={'/captain-riding'} className="w-full mt-2 text-lg flex justify-center bg-green-600 text-white font-semibold p-3 rounded-lg">Confirm</Link>
                    <button onClick={() => {
                        props.setConfirmRidePopUpPanel(false)
                        props.setRidePopUpPanel(false)
                    }} className="w-full mt-1 bg-red-600 text-lg text-white font-semibold p-3 rounded-lg">Cancel</button>
                </form>
            </div>
        </div>
    )
}

export default ConfirmRidePopUp