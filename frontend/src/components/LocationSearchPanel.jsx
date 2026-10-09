const LocationSearchPanel = (props) => {

  const location = [
    "93,Road No:3,Siddiq Nagar,Gachibowli,Hyderabad",
    "Gajularamaram,Medchal,Hyderabada",
    "kphb,near jntu,Kukatpally,Hyderbad",
    "Malla Reddy University,Medcha,Hyderabad"
  ]
  return (
    <div>
      <div>
        {/* this is just a sample data */}

        {
          location.map(function(elem,idx) {
             return <div key={idx} onClick={()=>{
              props.setVehiclePanel(true)
              props.setPanelOpen(false)
             }} className="flex gap-4 border-2 p-3 border-gray-50 active:border-black rounded-xl  items-center my-2 justify-start">
              <h2 className="bg-[#eee] h-8 w-12 rounded-full flex items-center justify-center"><i className="ri-map-pin-fill"></i></h2>
              <h4 className="font-medium">{elem}</h4>
            </div>
          })
        }
      </div>
    </div>
  )
}

export default LocationSearchPanel