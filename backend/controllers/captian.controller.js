const captianModel = require('../models/captian.model.js');
const captianService = require('../services/captian.services.js');
const { validationResult } = require('express-validator');


module.exports.registerCaptain = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname , email, password, vehicle } = req.body;

    const isCaptainExist = await captianModel.findOne({ email });

    if (isCaptainExist) {
        return res.status(400).json({ message: "Captain with this email already exists" });
    }
    
    const hashedPassword = await captianModel.hashPassword(password);

    const captian=await captianService.createCaptain({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
        colour: vehicle.colour,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType
    });
    
    const token = captian.generateAuthToken();
    res.status(201).json({ captian, token });
};