import { Link } from "react-router-dom";
import logo from "../assets/uberlogo.png";
import { useState } from "react";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState({});

  const submitHandler = (e) => {
    e.preventDefault();

    const data = {
      email: email,
      password: password,
    };
    
    setUserData(data);
    setEmail("");
    setPassword("");
  };

  return (
    <div className="p-7 h-screen flex flex-col justify-between">
      <div>
        <img className="w-16 mb-10" src={logo} alt="Uber" />

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
            New here?{" "}
            <Link to="/signup" className="text-blue-600">
              Create new Account
            </Link>
          </p>
        </form>
      </div>

      <div>
        <Link to={'/captain-login'}
          type="button"
          className="bg-[#88e] flex justify-center items-center text-white font-semibold mb-7 rounded px-4 py-2 w-full text-lg"
        >
          Sign in as captain
        </Link>
      </div>
    </div>
  );
};

export default UserLogin;