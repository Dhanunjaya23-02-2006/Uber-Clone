const rideService = require('../services/ride.service')
const { validationResult } = require('express-validator')
const mapService = require("../services/maps.services")
const rideModel = require("../models/ride.model")
const userModel = require("../models/user")
const { sendMessageToSocketId } = require("../socket")

const captainSearchRadiusInKm = 2

module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicleType } = req.body;

    try {
        const existingRide = await rideModel.findOne({
            user: req.user._id,
            status: { $in: ["pending", "accepted", "ongoing"] }
        })

        if (existingRide) {
            return res.status(409).json({
                message: "You already have an active ride. Cancel it or finish it before requesting another."
            })
        }

        const pickupCoordinates = await mapService.getAddressCoordinate(pickup)
        const captainsInRadius = await mapService.getCaptainsInTheRadius(
            pickupCoordinates.lat,
            pickupCoordinates.lng,
            captainSearchRadiusInKm
        )
        const availableCaptains = captainsInRadius.filter(
            (captain) => captain.status === "active" && captain.socketId
        )
        const busyCaptainIds = await rideModel.distinct("captain", {
            captain: { $in: availableCaptains.map((captain) => captain._id) },
            status: { $in: ["accepted", "ongoing"] }
        })
        const busyCaptainIdSet = new Set(busyCaptainIds.map((id) => id.toString()))
        const dispatchableCaptains = availableCaptains.filter(
            (captain) => !busyCaptainIdSet.has(captain._id.toString())
        )

        console.info("Nearby captain search for ride pickup:", {
            pickupCoordinates,
            radiusInKm: captainSearchRadiusInKm,
            nearbyCaptainCount: captainsInRadius.length,
            availableCaptainCount: dispatchableCaptains.length,
            captains: captainsInRadius.map((captain) => ({
                id: captain._id,
                location: captain.location,
                status: captain.status,
                connected: Boolean(captain.socketId)
            }))
        })

        const ride = await rideService.createRide({
            user: req.user._id,
            pickup,
            destination,
            vehicleType,
            pickupLocation: {
                ltd: pickupCoordinates.lat,
                lng: pickupCoordinates.lng
            }
        })
        await ride.populate("user", "fullname")

        const rideData = ride.toObject()
        delete rideData.otp

        let notifiedCaptainCount = 0
        for (const captain of dispatchableCaptains) {
            try {
                sendMessageToSocketId(captain.socketId,{
                    event: 'new-ride',
                    data: rideData
                })
                notifiedCaptainCount += 1
            } catch (error) {
                console.error(`Could not notify captain ${captain._id} about ride ${ride._id}:`, error)
            }
        }

        console.info(
            notifiedCaptainCount
                ? `Ride ${ride._id} sent to ${notifiedCaptainCount} nearby captain(s).`
                : `Ride ${ride._id} is pending until a nearby captain becomes available.`
        )
        delete rideData.user
        return res.status(201).json({ ...rideData, otp: ride.otp })
    } catch (error) {
        console.error("Could not create or dispatch ride:", error)
        const status = error.code === "ZERO_RESULTS" ? 404 : 502
        return res.status(status).json({
            message: error.code === "ZERO_RESULTS"
                ? "Could not locate the pickup address. Please choose a more precise address."
                : error.message
        })
    }
}

module.exports.acceptRide = async (req, res) => {
    const { rideId } = req.params

    if (req.captian.status !== "active" || !req.captian.socketId) {
        return res.status(409).json({
            message: "Connect and share your location before accepting a ride."
        })
    }

    try {
        const ride = await rideModel.findOneAndUpdate(
            { _id: rideId, status: "pending" },
            {
                $set: {
                    captain: req.captian._id,
                    status: "accepted"
                }
            },
            { returnDocument: "after", runValidators: true }
        )
            .populate("captain", "fullname email vehicle location upiId profileImage")
            .populate("user", "fullname socketId")

        if (!ride) {
            return res.status(409).json({
                message: "This ride is no longer available."
            })
        }

        const rideData = ride.toObject()
        delete rideData.otp
        const userSocketId = rideData.user?.socketId
        if (rideData.user) {
            delete rideData.user.socketId
        }

        if (userSocketId) {
            try {
                sendMessageToSocketId(userSocketId, {
                    event: "ride-confirmed",
                    data: { ride: rideData }
                })
            } catch (error) {
                console.error(`Ride ${ride._id} was accepted but rider notification failed:`, error)
            }
        } else {
            console.warn(`Ride ${ride._id} accepted, but the rider has no connected socket.`)
        }

        console.info(`Ride ${ride._id} accepted by captain ${req.captian._id}.`)
        return res.status(200).json({ ride: rideData })
    } catch (error) {
        console.error(`Could not accept ride ${rideId}:`, error)
        return res.status(500).json({ message: "Could not accept this ride." })
    }
}

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { rideId } = req.params
    const { otp } = req.body

    try {
        const ride = await rideModel.findOneAndUpdate(
            {
                _id: rideId,
                captain: req.captian._id,
                status: "accepted",
                otp
            },
            { $set: { status: "ongoing" } },
            { returnDocument: "after", runValidators: true }
        )

        if (!ride) {
            return res.status(400).json({
                message: "The OTP is incorrect or this ride is not awaiting verification."
            })
        }

        try {
            const user = await userModel.findById(ride.user).select("socketId")
            if (user?.socketId) {
                sendMessageToSocketId(user.socketId, {
                    event: "ride-started",
                    data: { rideId: ride._id, status: ride.status }
                })
            }
        } catch (error) {
            console.error(`Ride ${ride._id} started but rider notification failed:`, error)
        }

        console.info(`Ride ${ride._id} started by captain ${req.captian._id}.`)
        return res.status(200).json({
            message: "Ride started successfully.",
            ride: {
                _id: ride._id,
                pickup: ride.pickup,
                destination: ride.destination,
                fare: ride.fare,
                status: ride.status
            }
        })
    } catch (error) {
        console.error(`Could not verify OTP for ride ${rideId}:`, error)
        return res.status(500).json({ message: "Could not verify the ride OTP." })
    }
}

module.exports.getActiveRideForCaptain = async (req, res) => {
    try {
        const ride = await rideModel.findOne({
            captain: req.captian._id,
            status: { $in: ["accepted", "ongoing"] }
        })
            .populate("user", "fullname")
            .populate("captain", "fullname email vehicle location upiId profileImage")

        return res.status(200).json({ ride })
    } catch (error) {
        console.error("Could not load captain's active ride:", error)
        return res.status(500).json({ message: "Could not load the active ride." })
    }
}

module.exports.getActiveRideForUser = async (req, res) => {
    try {
        const ride = await rideModel.findOne({
            user: req.user._id,
            status: { $in: ["pending", "accepted", "ongoing"] }
        })
            .select("+otp")
            .populate("captain", "fullname email vehicle location upiId profileImage")
            .sort({ _id: -1 })

        return res.status(200).json({ ride })
    } catch (error) {
        console.error("Could not load user's active ride:", error)
        return res.status(500).json({ message: "Could not load the active ride." })
    }
}

module.exports.completeRide = async (req, res) => {
    const { rideId } = req.params
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const paymentMethod = req.body.paymentMethod
    const amountCollected = Math.round(Number(req.body.amountCollected) * 100) / 100

    if (!["cash", "upi"].includes(paymentMethod)) {
        return res.status(400).json({ message: "Choose cash or UPI before finishing the ride." })
    }

    if (paymentMethod === "upi" && !req.captian.upiId) {
        return res.status(409).json({
            message: "Add your UPI ID in captain details before accepting UPI payments."
        })
    }

    try {
        const activeRide = await rideModel.findOne({
            _id: rideId,
            captain: req.captian._id,
            status: "ongoing"
        }).select("fare paymentMethod")

        if (!activeRide) {
            return res.status(409).json({
                message: "This ride is not active or is not assigned to this captain."
            })
        }

        if (activeRide.paymentMethod !== paymentMethod) {
            return res.status(409).json({
                message: "The rider's selected payment method has changed. Refresh the ride and try again."
            })
        }

        if (!Number.isFinite(amountCollected) || amountCollected !== activeRide.fare) {
            return res.status(400).json({
                message: `Enter the exact ride fare of ₹${activeRide.fare}.`
            })
        }

        const ride = await rideModel.findOneAndUpdate(
            {
                _id: rideId,
                captain: req.captian._id,
                status: "ongoing",
                fare: amountCollected,
                paymentMethod
            },
            {
                $set: {
                    status: "completed",
                    paymentMethod,
                    paymentStatus: "paid",
                    amountCollected
                }
            },
            { returnDocument: "after", runValidators: true }
        )

        if (!ride) {
            return res.status(409).json({
                message: "This ride is not active or is not assigned to this captain."
            })
        }

        try {
            const user = await userModel.findById(ride.user).select("socketId")
            if (user?.socketId) {
                sendMessageToSocketId(user.socketId, {
                    event: "ride-completed",
                    data: {
                        rideId: ride._id,
                        status: ride.status,
                        paymentMethod: ride.paymentMethod,
                        paymentStatus: ride.paymentStatus,
                        amountCollected: ride.amountCollected
                    }
                })
            }
        } catch (error) {
            console.error(`Ride ${ride._id} completed but rider notification failed:`, error)
        }

        console.info(`Ride ${ride._id} completed by captain ${req.captian._id}.`)
        if (req.captian.socketId) {
            try {
                sendMessageToSocketId(req.captian.socketId, {
                    event: "captain-stats-updated",
                    data: { rideId: ride._id }
                })
            } catch (error) {
                console.error(`Ride ${ride._id} completed but captain stats notification failed:`, error)
            }
        }
        return res.status(200).json({
            message: "Ride completed successfully.",
            ride: {
                _id: ride._id,
                status: ride.status,
                paymentMethod: ride.paymentMethod,
                paymentStatus: ride.paymentStatus,
                amountCollected: ride.amountCollected
            }
        })
    } catch (error) {
        console.error(`Could not complete ride ${rideId}:`, error)
        return res.status(500).json({ message: "Could not complete this ride." })
    }
}

module.exports.selectPaymentMethod = async (req, res) => {
    const { rideId } = req.params
    const { paymentMethod } = req.body
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const ride = await rideModel.findOne({
            _id: rideId,
            user: req.user._id,
            status: "ongoing"
        }).populate("captain", "fullname upiId socketId")

        if (!ride) {
            return res.status(409).json({
                message: "Payment can only be selected for your active ride."
            })
        }

        if (paymentMethod === "upi" && !ride.captain?.upiId) {
            return res.status(409).json({
                message: "This captain has not set up a UPI payment ID. Please choose cash."
            })
        }

        const updatedRide = await rideModel.findOneAndUpdate(
            {
                _id: rideId,
                user: req.user._id,
                status: "ongoing"
            },
            { $set: { paymentMethod, paymentStatus: "pending" }, $unset: { amountCollected: 1 } },
            { returnDocument: "after", runValidators: true }
        )

        if (!updatedRide) {
            return res.status(409).json({
                message: "Ride status changed. Reload the page and try again."
            })
        }

        if (ride.captain?.socketId) {
            try {
                sendMessageToSocketId(ride.captain.socketId, {
                    event: "payment-method-selected",
                    data: { rideId, paymentMethod }
                })
            } catch (error) {
                console.error(`Payment method saved for ride ${rideId}, but captain notification failed:`, error)
            }
        }

        return res.status(200).json({
            ride: {
                _id: updatedRide._id,
                paymentMethod: updatedRide.paymentMethod,
                paymentStatus: updatedRide.paymentStatus
            },
            captain: {
                fullname: ride.captain?.fullname,
                upiId: ride.captain?.upiId
            }
        })
    } catch (error) {
        console.error(`Could not select payment method for ride ${rideId}:`, error)
        return res.status(500).json({ message: "Could not select a payment method." })
    }
}

module.exports.cancelRide = async (req, res) => {
    const { rideId } = req.params

    try {
        const cancellableRides = await rideModel.find({
            user: req.user._id,
            status: { $in: ["pending", "accepted"] }
        }).populate("captain", "socketId")

        if (!cancellableRides.some((ride) => ride._id.toString() === rideId)) {
            return res.status(409).json({
                message: "This ride can no longer be cancelled. It may have started or already ended."
            })
        }

        const cancellation = await rideModel.updateMany(
            {
                user: req.user._id,
                status: { $in: ["pending", "accepted"] }
            },
            { $set: { status: "cancelled" } },
            { runValidators: true }
        )

        if (cancellation.modifiedCount === 0) {
            return res.status(409).json({
                message: "This ride can no longer be cancelled. It may have started or already ended."
            })
        }

        for (const ride of cancellableRides) {
            if (!ride.captain?.socketId) continue
            try {
                sendMessageToSocketId(ride.captain.socketId, {
                    event: "ride-cancelled",
                    data: { rideId: ride._id, status: "cancelled" }
                })
            } catch (error) {
                console.error(`Ride ${ride._id} was cancelled but captain notification failed:`, error)
            }
        }

        console.info(
            `${cancellation.modifiedCount} active ride(s) cancelled by user ${req.user._id}.`
        )
        return res.status(200).json({
            message: "Ride request(s) cancelled successfully.",
            ride: { _id: rideId, status: "cancelled" }
        })
    } catch (error) {
        console.error(`Could not cancel ride ${rideId}:`, error)
        return res.status(500).json({ message: "Could not cancel this ride." })
    }
}

module.exports.getFare = async (req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { pickup, destination } = req.query;

    try {
        const fare=await rideService.getFare(pickup, destination)
        return res.status(200).json(fare)
    }
    catch (error){
        return res.status(500).json({ message: error.message })
    }
}