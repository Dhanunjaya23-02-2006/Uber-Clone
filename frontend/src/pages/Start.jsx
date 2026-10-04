import logo from "../assets/uberlogo.png"
import { Link } from "react-router-dom"


const Start = () => {
  return (
    <div className="flex min-h-dvh w-full flex-col">
      <div className="flex min-h-[45vh] flex-1 flex-col bg-[url(https://img.freepik.com/premium-photo/street-traffic-light-red-yellow-green-light-urban-traffic-signal-traffic-light-system_971034-46780.jpg)] bg-cover bg-center bg-no-repeat pt-6 sm:pt-8">
        <img className="ml-5 w-16 sm:ml-8" src={logo} alt="Uber" />
      </div>
      <div className="shrink-0 bg-white px-5 py-5 pb-7 sm:px-8">
        <h2 className="text-2xl font-bold sm:text-[30px]">Get Started with uber</h2>
        <Link to={'/login'} className="mt-5 flex w-full items-center justify-center rounded-lg bg-black py-3 text-white">Continue</Link>
      </div>
    </div>
  )
}

export default Start