import { Link } from "react-router-dom"
import logo from "../assets/uberlogo.png"
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import FinishRide from "../components/FinishRide";

const CaptianRiding = () => {

    const [finishRidePanel,setFinishRidePanel] = useState(false)
    const finishRidePanelRef= useRef(null)

    useGSAP(function () {
        if (finishRidePanel) {
            gsap.to(finishRidePanelRef.current, {
                transform: 'translateY(0)'
            })
        }
        else {
            gsap.to(finishRidePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [finishRidePanel])

    return (
        <div className="h-screen">

            <div className="fixed p-6 top-0 flex items-center justify-between w-full">
                <img className="w-16" src={logo} alt="" />
                <Link to={'/captain-login'} className="h-10 w-10 bg-white flex items-center justify-center rounded-full">
                    <i className="text-large font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>
            <div className="h-4/5">
                <img className="h-full w-full object-cover" src="https://www.hanbit.co.kr/data/editor/20210429161116_qvzgnfvw.gif" alt="" />
            </div>
            <div className="h-1/5 p-6 flex items-center justify-between bg-yellow-400 relative" onClick={()=>{
                setFinishRidePanel(true)
            }}>
                <h5 className="p-1 text-center w-[95%] top-0 absolute">
                    <i className="text-3xl text-gray-700 ri-arrow-up-wide-line"></i>
                </h5>
                <h4 className="text-xl font-semibold">4 KM Away</h4>
                <button className="bg-green-600 text-white font-semibold p-3 px-10 rounded-lg">Complete Ride</button>
            </div>
            <div ref={finishRidePanelRef} className="fixed w-full h-screen translate-y-full z-10 bottom-0 bg-white px-3 py-10 pt-12">
                <FinishRide setFinishRidePanel={setFinishRidePanel} />
            </div>
        </div>
    )
}

export default CaptianRiding