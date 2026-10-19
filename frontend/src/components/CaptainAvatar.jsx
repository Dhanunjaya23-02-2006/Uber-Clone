const CaptainAvatar = ({ captain, className = "h-12 w-12" }) => (
  <div
    className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 ${className}`}
    aria-label={`${captain?.fullname?.firstname || "Captain"} profile`}
  >
    {captain?.profileImage ? (
      <img
        src={captain.profileImage}
        alt={`${captain?.fullname?.firstname || "Captain"} profile`}
        className="h-full w-full object-cover"
      />
    ) : (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-3/4 w-3/4 fill-gray-500"
      >
        <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.42 0-8 2.24-8 5v2h16v-2c0-2.76-3.58-5-8-5Z" />
      </svg>
    )}
  </div>
)

export default CaptainAvatar
