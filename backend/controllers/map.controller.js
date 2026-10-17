const mapService = require("../services/maps.services")
const { validationResult } = require("express-validator")

module.exports.getCoordinates = async (req,res) =>{
    const { address } = req.query;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const coordinates = await mapService.getAddressCoordinate(address);
        return res.status(200).json(coordinates);
    } catch(error) {
        if (error.code === "ZERO_RESULTS") {
            return res.status(404).json({ message: "No coordinates found for this address" });
        }

        console.error("OpenRouteService geocoding request failed:", error.message);
        const status = error.code === "INVALID_REQUEST" || error.code === 400 ? 400 : 502;
        return res.status(status).json({
            message: status === 400 ? "Invalid address query" : "Geocoding service unavailable",
            providerStatus: error.code || "UNKNOWN_ERROR"
        });
    }
}

module.exports.getDistanceTime = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { origin, destination } = req.query;

    try {
        const [originCoordinates, destinationCoordinates] = await Promise.all([
            mapService.getAddressCoordinate(origin),
            mapService.getAddressCoordinate(destination)
        ]);
        const distanceTime = await mapService.getDistanceTime(
            originCoordinates,
            destinationCoordinates
        );
        return res.status(200).json(distanceTime);
    } catch (error) {
        if (error.code === "ZERO_RESULTS") {
            return res.status(404).json({ message: "No coordinates found for an address" });
        }

        console.error("OpenRouteService directions request failed:", error.message);
        const status = error.code === "INVALID_REQUEST" || error.code === 400 ? 400 : 502;
        return res.status(status).json({
            message: status === 400 ? "Invalid origin or destination" : "Directions service unavailable",
            providerStatus: error.code || "UNKNOWN_ERROR"
        });
    }
}


module.exports.getAutoCompleteSuggestion = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const suggestions = await mapService.getAutoCompleteSuggestion(req.query.input);
        return res.status(200).json(suggestions);
    } catch (error) {
        console.error("OpenRouteService autocomplete request failed:", error.message);
        const status = error.code === "INVALID_REQUEST" || error.code === 400 ? 400 : 502;
        return res.status(status).json({
            message: status === 400 ? "Invalid autocomplete query" : "Autocomplete service unavailable",
            providerStatus: error.code || "UNKNOWN_ERROR"
        });
    }
}