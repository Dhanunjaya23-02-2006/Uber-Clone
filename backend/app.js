const dotenv=require('dotenv');
dotenv.config();
const express=require("express");
const cors=require("cors");
const corsConfig=require("./cors.config");
const app=express();
const cookieParser=require("cookie-parser");
const connectDB=require("./db/db")
const userRoutes=require("./routes/user.routes");
const captianRoutes=require("./routes/captian.routes");
const mapsRoutes = require("./routes/maps.routes")
const rideRoutes = require("./routes/ride.routes")

app.use(cors(corsConfig));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/users",userRoutes);
app.use("/captains",captianRoutes);
app.use("/maps",mapsRoutes)
app.use('/rides',rideRoutes)


connectDB();

app.get("/",(req,res)=> {
    res.send("Welcome to uber clone");
})

module.exports=app