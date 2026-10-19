import { useState } from "react"
import axios from "axios"
import { QRCodeSVG } from "qrcode.react"

const FinishRide = ({ ride, setFinishRidePanel, onComplete }) => {
  const [isCompleting, setIsCompleting] = useState(false)
  const [error, setError] = useState("")
  const [amountCollected, setAmountCollected] = useState(String(ride?.fare ?? ""))
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const riderName = [
    ride?.user?.fullname?.firstname,
    ride?.user?.fullname?.lastname
  ].filter(Boolean).join(" ") || "Rider"
  const captainName = [
    ride?.captain?.fullname?.firstname,
    ride?.captain?.fullname?.lastname
  ].filter(Boolean).join(" ") || "Ride captain"
  const upiPaymentUri = ride?.captain?.upiId && ride?.fare != null
    ? `upi://pay?pa=${encodeURIComponent(ride.captain.upiId)}&pn=${encodeURIComponent(captainName)}&am=${Number(ride.fare).toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Ride ${ride._id}`)}`
    : null

  const completeRide = async (event) => {
    event.preventDefault()

    if (!ride?._id) {
      setError("Ride details are unavailable. Return to the captain home screen and reopen the active ride.")
      return
    }

    const collectedAmount = Number(amountCollected)
    if (!["cash", "upi"].includes(ride.paymentMethod)) {
      setError("Ask the rider to choose cash or UPI from the Make payment section.")
      return
    }
    if (ride.paymentMethod === "cash" && (
      !Number.isFinite(collectedAmount) || collectedAmount !== Number(ride.fare)
    )) {
      setError(`Enter the exact fare amount of ₹${ride.fare}.`)
      return
    }
    if (!paymentConfirmed) {
      setError(`Confirm that you received the ${ride.paymentMethod === "upi" ? "UPI" : "cash"} payment before finishing the ride.`)
      return
    }

    setIsCompleting(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL || "http://localhost:3000"}/rides/${ride._id}/complete`,
        { amountCollected: collectedAmount, paymentMethod: ride.paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      onComplete(response.data.ride)
    } catch (requestError) {
      console.error("Failed to complete ride:", requestError.response?.data || requestError)
      setError(
        requestError.response?.data?.message || "Could not complete this ride. Please try again."
      )
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div>
      <h5 className="p-1 text-center w-[93%] top-0 absolute" onClick={() => {
        setFinishRidePanel(false)
      }}><i className="text-3xl text-gray-500 ri-arrow-down-wide-line"></i></h5>
      <h2 className="text-2xl font-semibold mb-5">Finish this Ride</h2>
      <div className="flex items-center justify-between border-2 border-yellow-400 rounded-lg mt-4 p-3">
        <h2 className="text-lg font-medium">{riderName}</h2>
        <div className="text-right">
          <h5 className="text-lg font-semibold">₹{ride?.fare ?? "—"}</h5>
          <p className="text-sm capitalize text-gray-600">{ride?.paymentMethod || "Payment not selected"}</p>
        </div>
      </div>
      {ride?.paymentMethod === "upi" ? (
        <div className="mt-4 flex flex-col items-center rounded-lg bg-green-50 p-4">
          <h3 className="font-semibold">Show this QR to the rider</h3>
          {upiPaymentUri ? (
            <>
              <QRCodeSVG value={upiPaymentUri} size={208} includeMargin className="mt-3 bg-white p-2" />
              <p className="mt-2 text-sm font-medium">Your UPI ID: {ride.captain.upiId}</p>
              <p className="mt-1 text-sm text-gray-700">
                The QR requests exactly ₹{Number(ride.fare).toFixed(2)}.
              </p>
            </>
          ) : (
            <p role="alert" className="mt-2 text-sm text-red-600">
              Add your UPI ID in captain details before accepting this payment.
            </p>
          )}
          <p className="mt-2 text-center text-xs text-gray-600">
            Verify the payment in your UPI app before confirming receipt.
          </p>
        </div>
      ) : ride?.paymentMethod === "cash" ? (
        <div className="mt-4 rounded-lg bg-gray-50 p-3">
          <p className="font-medium">Collect ₹{Number(ride.fare).toFixed(2)} cash from the rider.</p>
        </div>
      ) : (
        <div role="status" className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm">
          Waiting for the rider to choose cash or UPI in the Make payment section.
        </div>
      )}
      <div className="w-full flex flex-col">
        <div className="w-full flex items-center justify-start gap-5 p-3 border-b-2">
          <i className="text-lg ri-map-pin-2-fill"></i>
          <div>
            <h3 className="font-medium">Pickup</h3>
            <p className="text-sm mt-1 text-gray-600">{ride?.pickup || "—"}</p>
          </div>
        </div>
        <div className="w-full flex items-center justify-start gap-5 p-3 border-b-2">
          <i className="text-lg ri-flag-fill"></i>
          <div>
            <h3 className="font-medium">Destination</h3>
            <p className="text-sm mt-1 text-gray-600">{ride?.destination || "—"}</p>
          </div>
        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      <form onSubmit={completeRide} className="mt-6 w-full">
        {ride?.paymentMethod === "cash" ? (
          <>
            <label htmlFor="cash-collected" className="block font-medium">
              Cash collected (₹)
            </label>
            <input
              id="cash-collected"
              name="amountCollected"
              type="number"
              inputMode="decimal"
              min={ride?.fare ?? 0}
              max={ride?.fare ?? 0}
              step="0.01"
              required
              value={amountCollected}
              onChange={(event) => setAmountCollected(event.target.value)}
              className="mt-2 w-full rounded-lg bg-gray-100 px-4 py-3"
            />
          </>
        ) : (
          <p className="rounded-lg bg-gray-100 px-4 py-3">
            UPI payment amount: ₹{Number(ride?.fare ?? 0).toFixed(2)}
          </p>
        )}
        <label className="mt-3 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={paymentConfirmed}
            onChange={(event) => setPaymentConfirmed(event.target.checked)}
            className="mt-1"
          />
          <span>
            I confirm I received ₹{Number(ride?.fare || 0).toFixed(2)} by {ride?.paymentMethod || "the selected payment method"}.
          </span>
        </label>
        <button
          type="submit"
          disabled={isCompleting || ride?.status !== "ongoing" || !paymentConfirmed || !ride?.paymentMethod}
          className="mt-4 flex w-full justify-center rounded-lg bg-green-600 p-3 font-semibold text-white disabled:opacity-50"
        >
          {isCompleting ? "Recording payment…" : "Confirm payment and finish ride"}
        </button>
        <p className="mt-3 text-sm text-gray-600">
          Enter the exact fare amount (₹{ride?.fare ?? "—"}). Payment is recorded when the ride is finished.
        </p>
      </form>
    </div>
  )
}

export default FinishRide
