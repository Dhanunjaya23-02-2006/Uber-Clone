const dotenv=require('dotenv');
dotenv.config();
const express=require("express");
const cors=require('cors')
const app=express();
const cookieParser=require("cookie-parser");
const connectDB=require("./db/db")
const userRoutes=require("./routes/user.routes");

app.use(express.json());
app.use(cookieParser());
app.use("/users",userRoutes);

connectDB();

app.use(cors());

app.get("/",(req,res)=> {
    res.send("Welcome to uber clone");
})

module.exports=app