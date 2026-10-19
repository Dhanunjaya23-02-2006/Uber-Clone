const mongoose = require('mongoose')

const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Captain'
    },
    pickup: {
        type: String,
        required: true
    },
    pickupLocation: {
        ltd: {
            type: Number,
            required: true,
            min: -90,
            max: 90
        },
        lng: {
            type: Number,
            required: true,
            min: -180,
            max: 180
        }
    },
    destination: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        enum: ["auto", "car", "moto"],
        required: true
    },
    fare: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'upi'],
        default: null
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    amountCollected: {
        type: Number,
        min: 0
    },
    status: {
        type: String,
        enum: [ 'pending', 'accepted', 'ongoing', 'completed' , 'cancelled' ],
        default: 'pending'
    },
    duration: {
        type: Number,
    },
    distance : {
        type: Number
    },
    paymentId: {
        type: String
    },
    orderId: {
        type: String
    },
    signature: {
        type: String
    },
    otp: {
        type: String,
        select: false,
        required: true
    }
})

module.exports = mongoose.model('ride',rideSchema)