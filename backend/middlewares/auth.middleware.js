const userModel=require("../models/user.js");
const BlacklistToken=require("../models/blacklistToken.model.js");
const captianModel=require("../models/captian.model.js");
const jwt=require("jsonwebtoken");

module.exports.authUser=async(req,res,next)=>{
    const token=req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }

    const isBlacklisted=await BlacklistToken.findOne({token: token});

    if(isBlacklisted){
        return res.status(401).json({message:"Unauthorized"});
    }

    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const user=await userModel.findById(decoded._id);
        if(!user){
            return res.status(401).json({message:"Unauthorized"});
        }
        req.user=user;
        return next();
    }
    catch (error) {
        return res.status(401).json({message:"Unauthorized"});
    }
}

module.exports.authCaptain=async(req,res,next)=>{
    const token=req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }

    const isBlacklisted=await BlacklistToken.findOne({token: token});

    if(isBlacklisted){
        return res.status(401).json({message:"Unauthorized"});
    }

    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const captian=await captianModel.findById(decoded._id);
        if(!captian){
            return res.status(401).json({message:"Unauthorized"});
        }
        req.captian=captian;
        return next();
    }
    catch (error) {
        return res.status(401).json({message:"Unauthorized"});
    }
};