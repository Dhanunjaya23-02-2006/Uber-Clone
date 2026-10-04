import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/uberlogo.png"

const UserSignup = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userData, setUserData] = useState({})

  const submitHandler = (e) => {
    e.preventDefault();
    const data = {
      fullname: {
        firstname: firstName,
        lastname: lastName,
      },
      email: email,
      password: password,
    };

    setUserData(data);
    setEmail("")
    setPassword("")
    setFirstName("")
    setLastName("")
  }


  return (
    <div className="p-7 h-screen flex flex-col justify-between">
      <div>
        <img className="w-16 mb-10" src={logo} alt="Uber" />

        <form onSubmit={(e) => {
          submitHandler(e);
        }}>
          <h3 className="text-lg font-medium mb-2">What's your name</h3>

          <div className="flex gap-4 mb-5">
            <input
              type="text"
              required
              className="bg-[#eeeeee] w-1/2 rounded px-4 py-2 border  text-lg placeholder:text-base"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value)
              }}
            />
            <input
              type="text"
              required
              className="bg-[#eeeeee] w-1/2 rounded px-4 py-2 border  text-lg placeholder:text-base"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
              }}
            />
          </div>
          <h3 className="text-lg font-medium mb-2">
            What's your email
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

          <button
            type="submit"
            className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 w-full text-lg"
          >
            Signup
          </button>

          <p className="text-center">
            Already have a account?{" "}
            <Link to="/login" className="text-blue-600">
              Login
            </Link>
          </p>
        </form>
      </div>

      <div>
        <p className="text-[10px] leading-tight">
          This site is protected by reCAPTCHA and the <span className="underline">Google Privacy
          Policy</span> and <span className="underline">Terms and Service apply.</span>
        </p>
      </div>
    </div>
  )
}

export default UserSignup