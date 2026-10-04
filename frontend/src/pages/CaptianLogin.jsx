import { Link } from "react-router-dom";
import { useState } from "react";

const CaptianLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captianData, setCaptianData] = useState({});

  const submitHandler = (e) => {
    e.preventDefault();

    const data = {
      email: email,
      password: password,
    };
    
    setCaptianData(data);
    setEmail("");
    setPassword("");
  };

  return (
    <div className="p-7 h-screen flex flex-col justify-between">
      <div>
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

      <div>
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