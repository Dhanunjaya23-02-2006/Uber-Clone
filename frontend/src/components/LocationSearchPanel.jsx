const LocationSearchPanel = ({
  suggestions,
  isLoading,
  error,
  onSelectSuggestion,
}) => {
  return (
    <div>
      {isLoading && <p className="py-3 text-sm text-gray-500">Searching locations...</p>}
      {error && <p role="alert" className="py-3 text-sm text-red-600">{error}</p>}
      {!isLoading && !error && suggestions.length === 0 && (
        <p className="py-3 text-sm text-gray-500">
          Enter at least 3 characters to search for a location.
        </p>
      )}
      <div>
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSelectSuggestion(suggestion)}
            className="flex w-full gap-4 border-2 border-gray-50 p-3 active:border-black rounded-xl items-center my-2 justify-start text-left"
          >
            <span className="bg-[#eee] h-8 w-12 rounded-full flex items-center justify-center">
              <i className="ri-map-pin-fill" aria-hidden="true"></i>
            </span>
            <span className="font-medium">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default LocationSearchPanel