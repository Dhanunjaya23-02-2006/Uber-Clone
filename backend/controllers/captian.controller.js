const blacklistTokenModel = require('../models/blacklistToken.model.js');
const captianModel = require('../models/captian.model.js');
const captianService = require('../services/captian.services.js');
const rideModel = require('../models/ride.model.js');
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
    const captainData = captian.toObject();
    delete captainData.password;
    res.status(201).json({ captian: captainData, token });
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
    const captainData = captian.toObject();
    delete captainData.password;
    res.status(200).json({ captian: captainData, token });
};

module.exports.getCaptianProfile = async (req, res , next) => {
    res.status(200).json({captian: req.captian})
}

module.exports.getCaptainStats = async (req, res) => {
    try {
        const [rideStats] = await rideModel.aggregate([
            {
                $match: {
                    captain: req.captian._id,
                    status: "completed"
                }
            },
            {
                $group: {
                    _id: null,
                    completedRides: { $sum: 1 },
                    totalEarnings: {
                        $sum: { $ifNull: ["$amountCollected", "$fare"] }
                    }
                }
            }
        ]);

        const captain = await captianModel.findById(req.captian._id)
            .select("status onlineSince totalOnlineSeconds");
        if (!captain) {
            return res.status(404).json({ message: "Captain account not found." });
        }
        const currentOnlineSeconds = captain.status === "active" && captain.onlineSince
            ? Math.max(0, Math.floor((Date.now() - captain.onlineSince.getTime()) / 1000))
            : 0;

        return res.status(200).json({
            totalEarnings: rideStats?.totalEarnings || 0,
            completedRides: rideStats?.completedRides || 0,
            onlineSeconds: (captain.totalOnlineSeconds || 0) + currentOnlineSeconds,
            isOnline: captain.status === "active"
        });
    } catch (error) {
        console.error("Could not load captain stats:", error);
        return res.status(500).json({ message: "Could not load captain stats." });
    }
}

module.exports.updateProfileImage = async (req, res) => {
    const { profileImage } = req.body

    if (profileImage !== null && typeof profileImage !== "string") {
        return res.status(400).json({ message: "Choose a valid profile image." })
    }

    if (typeof profileImage === "string") {
        const match = profileImage.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/)
        if (!match) {
            return res.status(400).json({ message: "Profile image must be a JPEG image." })
        }

        const imageBuffer = Buffer.from(match[1], "base64")
        const isJpeg = imageBuffer.length >= 3 &&
            imageBuffer[0] === 0xff &&
            imageBuffer[1] === 0xd8 &&
            imageBuffer[2] === 0xff
        if (!isJpeg || imageBuffer.length > 700 * 1024) {
            return res.status(400).json({
                message: "Profile image must be a valid JPEG smaller than 700 KB."
            })
        }
    }

    try {
        req.captian.profileImage = profileImage || undefined
        await req.captian.save()
        const captainData = req.captian.toObject()
        delete captainData.password
        return res.status(200).json({ captian: captainData })
    } catch (error) {
        console.error("Could not update captain profile image:", error)
        return res.status(500).json({ message: "Could not update profile image." })
    }
}

module.exports.updatePaymentDetails = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        req.captian.upiId = req.body.upiId.trim()
        await req.captian.save()

        const captainData = req.captian.toObject()
        delete captainData.password
        return res.status(200).json({ captian: captainData })
    } catch (error) {
        console.error("Could not update captain payment details:", error)
        return res.status(500).json({ message: "Could not update payment details." })
    }
}

module.exports.logoutCaptian = async (req , res , next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];

    await blacklistTokenModel.create({ token });
    const update = {
        $set: { status: "inactive" },
        $unset: { socketId: 1, onlineSince: 1 }
    };
    if (req.captian.status === "active" && req.captian.onlineSince) {
        update.$inc = {
            totalOnlineSeconds: Math.max(
                0,
                Math.floor((Date.now() - req.captian.onlineSince.getTime()) / 1000)
            )
        };
    }
    await captianModel.findOneAndUpdate(
        { _id: req.captian._id, status: req.captian.status },
        update
    );

    res.clearCookie('token');

    res.status(200).json({ message: "Logout successfully"})
};