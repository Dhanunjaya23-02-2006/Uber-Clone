import { useState } from "react"

const LookingForDriver = (props) => {
    const [isConfirmingCancel, setIsConfirmingCancel] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)
    const fareType = {
        UberGo: "car",
        Moto: "moto",
        UberAuto: "auto"
    }[props.vehicleType]
    const fare = props.fare?.[fareType]

    const cancelRide = async () => {
        setIsCancelling(true)
        try {
            const cancelled = await props.onCancelRide()
            if (cancelled) setIsConfirmingCancel(false)
        } finally {
            setIsCancelling(false)
        }
    }

    return (
        <div>
            <h5 className="p-1 text-center w-[93%] top-0 absolute" onClick={() => {
                props.setVehicleFound(false)
            }}><i className="text-3xl text-gray-500 ri-arrow-down-wide-line"></i></h5>
            <h2 className="text-2xl font-semibold mb-2">Looking for a Driver</h2>
            <p className="text-sm text-gray-600">
                We&apos;re searching for a nearby driver. We&apos;ll show the driver details here as soon as one accepts.
            </p>
            <div className="w-full mt-4">
                <div className="flex items-center gap-5 p-3 border-b-2">
                    <i className="text-lg ri-map-pin-2-fill"></i>
                    <div>
                        <h3 className="font-medium">Pickup</h3>
                        <p className="text-sm mt-1 text-gray-600">{props.pickup}</p>
                    </div>
                </div>
                <div className="flex items-center gap-5 p-3 border-b-2">
                    <i className="text-lg ri-flag-fill"></i>
                    <div>
                        <h3 className="font-medium">Destination</h3>
                        <p className="text-sm mt-1 text-gray-600">{props.destination}</p>
                    </div>
                </div>
                <div className="flex items-center gap-5 p-3">
                    <i className="text-lg ri-currency-line"></i>
                    <div>
                        <h3 className="font-medium">{fare != null ? `₹${fare}` : "—"}</h3>
                        <p className="text-sm mt-1 text-gray-600">Cash</p>
                    </div>
                </div>
            </div>
            {props.error && <p role="alert" className="mt-2 text-sm text-red-600">{props.error}</p>}
            {props.ride?._id && (
                isConfirmingCancel ? (
                    <div className="mt-4">
                        <p className="text-sm text-gray-700">Cancel this ride request?</p>
                        <div className="mt-2 flex gap-3">
                            <button
                                type="button"
                                disabled={isCancelling}
                                onClick={() => setIsConfirmingCancel(false)}
                                className="flex-1 rounded-lg bg-gray-200 p-2 font-semibold text-gray-800 disabled:opacity-50"
                            >
                                Keep ride
                            </button>
                            <button
                                type="button"
                                disabled={isCancelling}
                                onClick={cancelRide}
                                className="flex-1 rounded-lg bg-red-600 p-2 font-semibold text-white disabled:opacity-50"
                            >
                                {isCancelling ? "Cancelling…" : "Confirm cancel"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsConfirmingCancel(true)}
                        className="w-full mt-4 border border-red-600 text-red-600 font-semibold p-2 rounded-lg"
                    >
                        Cancel ride
                    </button>
                )
            )}
        </div>
    )
}

export default LookingForDriver
