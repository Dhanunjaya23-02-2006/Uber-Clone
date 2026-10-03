const captianModel = require('../models/captian.model.js');


module.exports.createCaptain = async ({
    firstname, lastname, email, password,
    colour, plate, capacity, vehicleType
}) => {
    if(!firstname || !email || !password || !colour || !plate || !capacity || !vehicleType) {
        throw new Error("Missing required fields");
    }
    const captain = await captianModel.create({
        fullname: {
            firstname: firstname,
            lastname: lastname
        },
        email,
        password,
        vehicle: {
            colour,
            plate,
            capacity,
            vehicleType
        }
    });
    return captain;
};