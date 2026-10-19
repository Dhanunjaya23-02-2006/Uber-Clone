import { useCallback, useContext, useEffect, useRef, useState } from "react"
import axios from "axios"
import { CaptainDataContext } from "../context/CaptianContext"
import SocketContext from "../context/SocketContext"
import CaptainAvatar from "./CaptainAvatar"

const encodeProfileImage = (file) => new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
        URL.revokeObjectURL(imageUrl)
        if (image.width > 8192 || image.height > 8192) {
            reject(new Error("Choose an image with dimensions no larger than 8192 × 8192."))
            return
        }
        const canvas = document.createElement("canvas")
        const size = Math.min(image.width, image.height, 512)
        const offsetX = (image.width - size) / 2
        const offsetY = (image.height - size) / 2
        canvas.width = 512
        canvas.height = 512
        const context = canvas.getContext("2d")
        if (!context) {
            reject(new Error("Could not process the selected image."))
            return
        }
        context.drawImage(image, offsetX, offsetY, size, size, 0, 0, 512, 512)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.78)
        if (dataUrl.length > 950000) {
            reject(new Error("Choose a smaller image file."))
            return
        }
        resolve(dataUrl)
    }
    image.onerror = () => {
        URL.revokeObjectURL(imageUrl)
        reject(new Error("Could not read the selected image."))
    }
    image.src = imageUrl
})

const CaptainDetails = () => {
    const { captain, setCaptain } = useContext(CaptainDataContext);
    const { receiveMessage } = useContext(SocketContext)
    const [upiId, setUpiId] = useState(captain?.upiId || "")
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const [stats, setStats] = useState({
        totalEarnings: 0,
        completedRides: 0,
        onlineSeconds: 0,
        isOnline: false
    })
    const [statsError, setStatsError] = useState("")
    const [isSavingImage, setIsSavingImage] = useState(false)
    const [imageError, setImageError] = useState("")
    const fileInputRef = useRef(null)

    const loadStats = useCallback(async () => {
        try {
            const token = localStorage.getItem("token")
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL || "http://localhost:3000"}/captains/stats`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setStats(response.data)
            setStatsError("")
        } catch (requestError) {
            console.error("Could not load captain dashboard stats:", requestError.response?.data || requestError)
            setStatsError(requestError.response?.data?.message || "Could not load captain statistics.")
        }
    }, [])

    useEffect(() => {
        if (!captain?._id) return

        const initialLoadId = window.setTimeout(loadStats, 0)
        const intervalId = window.setInterval(loadStats, 30000)
        const unsubscribeRideCompleted = receiveMessage("captain-stats-updated", loadStats)
        const unsubscribeAvailability = receiveMessage("availability:updated", loadStats)

        return () => {
            window.clearTimeout(initialLoadId)
            window.clearInterval(intervalId)
            unsubscribeRideCompleted()
            unsubscribeAvailability()
        }
    }, [captain?._id, loadStats, receiveMessage])

    const saveUpiId = async (event) => {
        event.preventDefault()
        setIsSaving(true)
        setMessage("")
        setError("")
        try {
            const token = localStorage.getItem("token")
            const response = await axios.patch(
                `${import.meta.env.VITE_BASE_URL || "http://localhost:3000"}/captains/payment-details`,
                { upiId: upiId.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setCaptain(response.data.captian)
            setUpiId(response.data.captian.upiId || "")
            setMessage("UPI payment ID saved.")
        } catch (requestError) {
            console.error("Could not save captain UPI ID:", requestError.response?.data || requestError)
            setError(
                requestError.response?.data?.errors?.[0]?.msg ||
                requestError.response?.data?.message ||
                "Could not save the UPI ID."
            )
        } finally {
            setIsSaving(false)
        }
    }

    const saveProfileImage = async (event) => {
        const file = event.target.files?.[0]
        event.target.value = ""
        if (!file) return
        if (!file.type.startsWith("image/")) {
            setImageError("Choose an image file.")
            return
        }
        if (file.size > 10 * 1024 * 1024) {
            setImageError("Choose an image smaller than 10 MB.")
            return
        }

        setIsSavingImage(true)
        setImageError("")
        try {
            const profileImage = await encodeProfileImage(file)
            const token = localStorage.getItem("token")
            const response = await axios.patch(
                `${import.meta.env.VITE_BASE_URL || "http://localhost:3000"}/captains/profile-image`,
                { profileImage },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setCaptain((currentCaptain) => ({
                ...currentCaptain,
                ...response.data.captian
            }))
        } catch (requestError) {
            console.error("Could not update captain profile image:", requestError.response?.data || requestError)
            setImageError(
                requestError.response?.data?.message ||
                requestError.message ||
                "Could not update your profile image."
            )
        } finally {
            setIsSavingImage(false)
        }
    }

    const removeProfileImage = async () => {
        setIsSavingImage(true)
        setImageError("")
        try {
            const token = localStorage.getItem("token")
            const response = await axios.patch(
                `${import.meta.env.VITE_BASE_URL || "http://localhost:3000"}/captains/profile-image`,
                { profileImage: null },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setCaptain((currentCaptain) => ({
                ...currentCaptain,
                ...response.data.captian
            }))
        } catch (requestError) {
            console.error("Could not remove captain profile image:", requestError.response?.data || requestError)
            setImageError(requestError.response?.data?.message || "Could not remove your profile image.")
        } finally {
            setIsSavingImage(false)
        }
    }

    const onlineHours = (stats.onlineSeconds / 3600).toFixed(1)
    const earnings = new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2
    }).format(stats.totalEarnings)

    return (
        <div className="h-3/5 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center justify-start gap-4">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSavingImage}
                            className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-60"
                            aria-label="Edit profile image"
                        >
                            <CaptainAvatar captain={captain} className="h-12 w-12" />
                            <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white">
                                <i className="ri-camera-line" aria-hidden="true"></i>
                            </span>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={saveProfileImage}
                            className="hidden"
                            aria-label="Choose captain profile image"
                        />
                    </div>
                    <h4 className="text-lg font-medium capitalize">{captain?.fullname?.firstname+ " " + captain?.fullname?.lastname}</h4>
                </div>
                {(isSavingImage || imageError || captain?.profileImage) && (
                    <div className="mt-2 flex items-center gap-3 text-xs">
                        {isSavingImage && <p role="status" className="text-gray-600">Saving profile image…</p>}
                        {imageError && <p role="alert" className="text-red-600">{imageError}</p>}
                        {!isSavingImage && captain?.profileImage && (
                            <button
                                type="button"
                                onClick={removeProfileImage}
                                className="font-medium text-gray-600 underline"
                            >
                                Remove photo
                            </button>
                        )}
                    </div>
                )}
                <div>
                    <h4 className="text-xl font-semibold">₹{earnings}</h4>
                    <p className="text-sm text-gray-600">Earned</p>
                </div>
            </div>
            {statsError && <p role="alert" className="mt-3 text-sm text-red-600">{statsError}</p>}
            <div className="flex p-3 mt-6 bg-gray-200 rounded-xl justify-between gap-5 items-center">
                <div className="text-center">
                    <i className="text-3xl mb-2 font-thin ri-timer-2-line"></i>
                    <h5 className="text-lg font-medium">{onlineHours}</h5>
                    <p className="text-sm text-gray-600">Hours Online</p>
                </div>
                <div className="text-center">
                    <i className="text-3xl mb-2 font-thin ri-speed-up-line"></i>
                    <h5 className="text-lg font-medium">{stats.completedRides}</h5>
                    <p className="text-sm text-gray-600">Rides Completed</p>
                </div>
                <div className="text-center">
                    <i className="text-3xl mb-2 font-thin ri-bookmark-3-fill"></i>
                    <h5 className="text-lg font-medium">{stats.isOnline ? "Online" : "Offline"}</h5>
                    <p className="text-sm text-gray-600">Availability</p>
                </div>
            </div>
            <form onSubmit={saveUpiId} className="mt-5 rounded-xl bg-gray-100 p-4">
                <label htmlFor="captain-upi-id" className="block text-sm font-semibold">
                    UPI ID for rider QR payments
                </label>
                <div className="mt-2 flex gap-2">
                    <input
                        id="captain-upi-id"
                        type="text"
                        required
                        pattern="[\w.-]{2,256}@[A-Za-z]{2,64}"
                        title="Enter a valid UPI ID, such as name@bank"
                        value={upiId}
                        onChange={(event) => setUpiId(event.target.value)}
                        placeholder="name@bank"
                        className="min-w-0 flex-1 rounded-lg border bg-white px-3 py-2"
                    />
                    <button
                        type="submit"
                        disabled={isSaving || !upiId.trim()}
                        className="rounded-lg bg-black px-4 py-2 font-semibold text-white disabled:opacity-50"
                    >
                        {isSaving ? "Saving…" : "Save"}
                    </button>
                </div>
                {message && <p role="status" className="mt-2 text-sm text-green-700">{message}</p>}
                {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
                <p className="mt-2 text-xs text-gray-600">
                    Required to receive UPI QR payments. QR payments are confirmed manually by you.
                </p>
            </form>
        </div>
    )
}

export default CaptainDetails