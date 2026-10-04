import logo from "../assets/uberlogo.png"
import { Link } from "react-router-dom"


const Home = () => {
  return (
    <div className="flex h-screen min-h-[500px] w-full flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col bg-[url(https://img.freepik.com/premium-photo/street-traffic-light-red-yellow-green-light-urban-traffic-signal-traffic-light-system_971034-46780.jpg)] bg-[length:auto_100%] bg-center bg-no-repeat pt-8">
        <img className="ml-8 w-16" src={logo} alt="Uber" />
      </div>
      <div className="shrink-0 bg-white px-4 py-4 pb-7">
        <h2 className="text-[30px] font-bold">Get Started with uber</h2>
        <Link to={'/login'}  className="flex items-center justify-center mt-5 w-full rounded-lg bg-black py-3 text-white">Continue</Link>
      </div>
    </div>
  )
}

export default Home