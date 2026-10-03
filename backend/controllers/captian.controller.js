const blacklistTokenModel = require('../models/blacklistToken.model.js');
const captianModel = require('../models/captian.model.js');
const captianService = require('../services/captian.services.js');
const { validationResult } = require('express-validator');

module.exports.registerCaptain = async (req, res, next) => {
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


module.exports.loginCaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;  
    
    const captian = await captianModel.findOne({ email }).select('+password');

    if (!captian) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await captian.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = captian.generateAuthToken();
    res.cookie('token',token);
    res.status(200).json({ captian, token });
};

module.exports.getCaptianProfile = async (req, res , next) => {
    res.status(200).json({captian: req.captian})
}

module.exports.logoutCaptian = async (req , res , next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];

    await blacklistTokenModel.create({ token });

    res.clearCookie('token');

    res.status(200).json({ message: "Logout successfully"})
};