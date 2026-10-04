const dotenv=require('dotenv');
dotenv.config();
const express=require("express");
const app=express();
const cookieParser=require("cookie-parser");
const connectDB=require("./db/db")
const userRoutes=require("./routes/user.routes");
const captianRoutes=require("./routes/captian.routes");

app.use(express.json());
app.use(cookieParser());
app.use("/users",userRoutes);
app.use("/captains",captianRoutes);


connectDB();

app.get("/",(req,res)=> {
    res.send("Welcome to uber clone");
})

module.exports=app