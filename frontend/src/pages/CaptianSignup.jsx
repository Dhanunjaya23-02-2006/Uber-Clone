import React from "react";
import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptianContext";

import axios from 'axios'

const CaptianSignup = () => {

  const navigate=useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  const { setCaptain } = React.useContext(CaptainDataContext)

  const submitHandler = async (e) => {
    e.preventDefault();
    const captainData ={
      fullname: {
        firstname: firstName,
        lastname: lastName,
      },
      email: email,
      password: password,
      vehicle: {
        colour: vehicleColor,
        plate: vehiclePlate,
        capacity: vehicleCapacity,
        vehicleType: vehicleType
      }
    };

    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`,captainData)

    if(response.status === 201){
      const data = response.data
      setCaptain(data.captian)
      localStorage.setItem('token',data.token)
      navigate('/captain-home')
    }
    
    setEmail("")
    setPassword("")
    setFirstName("")
    setLastName("")
    setVehicleColor("")
    setVehiclePlate("")
    setVehicleCapacity("")
    setVehicleType("")
  }

  return (
    <div className="flex min-h-dvh flex-col justify-between gap-8 px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-md">
        <img className="w-16 mb-10" src={"https://logos-world.net/wp-content/uploads/2020/05/Uber-Emblem.png"} alt="Uber" />

        <form className="w-full" onSubmit={(e) => {
          submitHandler(e);
        }}>
          <h3 className="text-lg font-medium mb-2">What's our Captian's name</h3>

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <input
              type="text"
              required
              className="w-full min-w-0 rounded border bg-[#eeeeee] px-4 py-2 text-lg placeholder:text-base"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value)
              }}
            />
            <input
              type="text"
              required
              className="w-full min-w-0 rounded border bg-[#eeeeee] px-4 py-2 text-lg placeholder:text-base"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
              }}
            />
          </div>
          <h3 className="text-lg font-medium mb-2">
            What's our Captian's email
          </h3>

          <input
            type="email"
            className="bg-[#eeeeee] mb-5 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
            required
            placeholder="email@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
            }}
          />

          <h3 className="text-lg font-medium mb-2">
            Enter Password
          </h3>

          <input
            type="password"
            className="bg-[#eeeeee] mb-5 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
            required
            placeholder="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
            }}
          />

          <h3 className="text-lg font-medium mb-2">Vehicle details</h3>
          <div className="mb-5 grid grid-cols-2 gap-3">
            <input
              type="text"
              required
              className="w-full min-w-0 rounded border bg-[#eeeeee] px-4 py-2 text-lg placeholder:text-base"
              placeholder="Vehicle color"
              value={vehicleColor}
              onChange={(e) => setVehicleColor(e.target.value)}
            />
            <input
              type="text"
              required
              className="w-full min-w-0 rounded border bg-[#eeeeee] px-4 py-2 text-lg placeholder:text-base"
              placeholder="Vehicle plate"
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
            />
            <input
              type="number"
              required
              min="1"
              className="w-full min-w-0 rounded border bg-[#eeeeee] px-4 py-2 text-lg placeholder:text-base"
              placeholder="Vehicle capacity"
              value={vehicleCapacity}
              onChange={(e) => setVehicleCapacity(e.target.value)}
            />
            <select
              required
              className="w-full min-w-0 rounded border bg-[#eeeeee] px-4 py-2 text-lg"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <option value="" disabled>Select vehicle type</option>
              <option value="car">Car</option>
              <option value="auto">Auto</option>
              <option value="motorcycle">Moto</option>
            </select>
          </div>

          
          <button
            type="submit"
            className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 w-full text-lg"
          >
            Create Captain Account
          </button>

          <p className="text-center">
            Already have a account?{" "}
            <Link to="/captain-login" className="text-blue-600">
              Login
            </Link>
          </p>
        </form>
      </div>

      <div className="mx-auto w-full max-w-md">
        <p className="text-[10px] leading-tight">
          This site is protected by reCAPTCHA and the <span className="underline">Google Privacy
            Policy</span> and <span className="underline">Terms and Service apply.</span>
        </p>
      </div>
    </div>
  )
}

export default CaptianSignup