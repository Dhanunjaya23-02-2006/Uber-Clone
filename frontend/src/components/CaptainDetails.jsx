import { useContext } from "react"
import { CaptainDataContext } from "../context/CaptianContext"

const CaptainDetails = () => {

    const { captain } = useContext(CaptainDataContext);

    return (
        <div className="h-3/5 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center justify-start gap-4">
                    <img className="h-10 w-10 rounded-full object-cover" src="https://tse3.mm.bing.net/th/id/OIP.zxOSa5foN7Fm1AawgHzDLwHaFj?r=0&w=1200&h=900&rs=1&pid=ImgDetMain&o=7&rm=3" alt="" />
                    <h4 className="text-lg font-medium capitalize">{captain?.fullname?.firstname+ " " + captain?.fullname?.lastname}</h4>
                </div>
                <div>
                    <h4 className="text-xl font-semibold">₹295.20</h4>
                    <p className="text-sm text-gray-600">Earned</p>
                </div>
            </div>
            <div className="flex p-3 mt-6 bg-gray-200 rounded-xl justify-between gap-5 items-center">
                <div className="text-center">
                    <i className="text-3xl mb-2 font-thin ri-timer-2-line"></i>
                    <h5 className="text-lg font-medium">10.2</h5>
                    <p className="text-sm text-gray-600">Hours Online</p>
                </div>
                <div className="text-center">
                    <i className="text-3xl mb-2 font-thin ri-speed-up-line"></i>
                    <h5 className="text-lg font-medium">10.2</h5>
                    <p className="text-sm text-gray-600">Hours Online</p>
                </div>
                <div className="text-center">
                    <i className="text-3xl mb-2 font-thin ri-bookmark-3-fill"></i>
                    <h5 className="text-lg font-medium">10.2</h5>
                    <p className="text-sm text-gray-600">Hours Online</p>
                </div>
            </div>
        </div>
    )
}

export default CaptainDetails