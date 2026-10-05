import React from "react";
import { Link,useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios"
import { CaptainDataContext } from "../context/CaptianContext";

const CaptianLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setCaptain} = React.useContext(CaptainDataContext)
  const navigate = useNavigate();

  const submitHandler =async (e) => {
    e.preventDefault();

    const Captain = {
      email: email,
      password: password,
    };

    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`, Captain);

    if(response.status === 200){
      const data=response.data;
      setCaptain(data.captian);
      localStorage.setItem('token',data.token);
      navigate('/captain-home')
    }
    
    setEmail("");
    setPassword("");
  };

  return (
    <div className="flex min-h-dvh flex-col justify-between gap-8 px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-md">
        <img className="w-16 mb-10" src={"https://logos-world.net/wp-content/uploads/2020/05/Uber-Emblem.png"} alt="Uber" />

        <form onSubmit={submitHandler}>
          <h3 className="text-lg font-medium mb-2">
            What's your email
          </h3>

          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
            placeholder="email@example.com"
          />

          <h3 className="text-lg font-medium mb-2">
            Enter Password
          </h3>

          <input
            type="password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
            placeholder="password"
          />

          <button
            type="submit"
            className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 w-full text-lg"
          >
            Login
          </button>

          <p className="text-center">
            Join a fleet?{" "}
            <Link to="/captain-signup" className="text-blue-600">
              Register as a Captian
            </Link>
          </p>
        </form>
      </div>

      <div className="mx-auto w-full max-w-md">
        <Link to={'/login'}
          type="button"
          className="bg-[#3af] flex justify-center items-center text-white font-semibold mb-7 rounded px-4 py-2 w-full text-lg"
        >
          Sign in as User
        </Link>
      </div>
    </div>
  );
};

export default CaptianLogin;