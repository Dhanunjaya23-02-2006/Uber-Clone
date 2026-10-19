const rideModel = require('../models/ride.model')
const mapService = require('./maps.services')
const crypto = require('crypto')

async function  getFare(pickup, destination) {
    if(!pickup || !destination){
        throw new Error('Pickup and destination are required');
    }

    const [originCoordinates, destinationCoordinates] = await Promise.all([
        mapService.getAddressCoordinate(pickup),
        mapService.getAddressCoordinate(destination)
    ]);
    const distanceTime = await mapService.getDistanceTime(
        originCoordinates,
        destinationCoordinates
    );
    const distanceInKm = distanceTime.distance.value / 1000;
    const durationInMinutes = distanceTime.duration.value / 60;

    const baseFare = { auto: 30, car: 50, moto: 20 };
    const perKmRate = { auto: 10, car: 15, moto: 8 };
    const perMinuteRate = { auto: 1.5, car: 2, moto: 1 };

    return Object.fromEntries(
        Object.keys(baseFare).map((vehicle) => [
            vehicle,
            Math.round(
                baseFare[vehicle] +
                distanceInKm * perKmRate[vehicle] +
                durationInMinutes * perMinuteRate[vehicle]
            )
        ])
    );
}

module.exports.getFare = getFare;

function getOtp(num){
    function generateOtp(num) {
        const otp = crypto.randomInt(Math.pow(10, num-1),Math.pow(10, num)).toString();
        return otp
    }
    return generateOtp(num)
}

module.exports.createRide = async ({
    user,pickup,destination,vehicleType,pickupLocation
}) => {
    if(!user || !pickup || !destination || !vehicleType || !pickupLocation) {
        throw new Error('All fields are required')
    }

    const fare = await getFare(pickup, destination)

    const ride = await rideModel.create({
        user,
        pickup,
        destination,
        vehicleType,
        pickupLocation,
        otp: getOtp(6),
        fare: fare[ vehicleType ]
    })

    return ride;
}
