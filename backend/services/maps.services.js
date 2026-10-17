const axios = require("axios");
const captainModel = require('../models/captian.model')

module.exports.getAddressCoordinate = async (address) => {
  if (typeof address !== "string" || !address.trim()) {
    throw new Error("A non-empty address is required");
  }

  const apiKey = process.env.OPENROUTESERVICE_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTESERVICE_API_KEY is not configured");
  }

  let response;

  try {
    response = await axios.get(
      "https://api.openrouteservice.org/geocode/search",
      {
        params: {
          text: address.trim(),
          "boundary.country": "IND",
          layers: "venue,address",
          size: 5,
        },
        headers: {
          Authorization: apiKey,
        },
        timeout: 10000,
      }
    );
  } catch (err) {
    console.error(
      "ORS error:",
      err.response?.status,
      err.response?.data || err.message
    );

    const error = new Error("OpenRouteService geocoding request failed");
    error.code = err.response?.status || "PROVIDER_ERROR";
    throw error;
  }

  const features = response.data?.features;
  const preciseFeature = Array.isArray(features)
    ? features.find((feature) => {
        const coordinates = feature?.geometry?.coordinates;
        if (
          !["venue", "address"].includes(feature?.properties?.layer) ||
          !Array.isArray(coordinates) ||
          coordinates.length < 2
        ) {
          return false;
        }

        const [lng, lat] = coordinates;
        return (
          Number.isFinite(lat) &&
          Number.isFinite(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        );
      })
    : undefined;

  if (!preciseFeature) {
    const error = new Error(
      "No precise address or venue match found in India; provide a more complete address"
    );
    error.code = "ZERO_RESULTS";
    throw error;
  }

  const [lng, lat] = preciseFeature.geometry.coordinates;

  return { lat, lng };
};


module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }

  const apiKey = process.env.OPENROUTESERVICE_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTESERVICE_API_KEY is not configured");
  }

  // Expected format: { lat: 17.385, lng: 78.4867 }
  const isValidCoordinate = (point) =>
    Number.isFinite(Number(point.lat)) &&
    Number(point.lat) >= -90 &&
    Number(point.lat) <= 90 &&
    Number.isFinite(Number(point.lng)) &&
    Number(point.lng) >= -180 &&
    Number(point.lng) <= 180;

  if (!isValidCoordinate(origin) || !isValidCoordinate(destination)) {
    throw new Error("Invalid origin or destination coordinates");
  }

  const url =
    "https://api.openrouteservice.org/v2/directions/driving-car";

  try {
    const response = await axios.get(url, {
      params: {
        start: `${Number(origin.lng)},${Number(origin.lat)}`,
        end: `${Number(destination.lng)},${Number(destination.lat)}`,
      },
      headers: {
        Authorization: apiKey,
      },
    });

    const summary = response.data.features?.[0]?.properties?.summary;

    if (!summary) {
      throw new Error("No route found between these locations");
    }

    const distanceMeters = Math.round(summary.distance);
    const durationSeconds = Math.round(summary.duration);
    const totalMinutes = Math.floor(durationSeconds / 60);
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;
    const durationParts = [];

    if (days > 0) {
      durationParts.push(`${days} ${days === 1 ? "day" : "days"}`);
    }
    if (hours > 0) {
      durationParts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
    }
    if (minutes > 0 || durationParts.length === 0) {
      durationParts.push(`${minutes} ${minutes === 1 ? "min" : "mins"}`);
    }

    const distanceKm = distanceMeters / 1000;
    const distanceText =
      distanceKm >= 1000
        ? `${Math.round(distanceKm).toLocaleString("en-US")} km`
        : `${distanceKm.toFixed(2)} km`;

    return {
      distance: {
        text: distanceText,
        value: distanceMeters,
      },
      duration: {
        text: durationParts.join(" "),
        value: durationSeconds,
      },
    };
  } catch (error) {
    console.error(
      "ORS distance request failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports.getAutoCompleteSuggestion = async (input) => {
  if (typeof input !== "string" || !input.trim()) {
    const error = new Error("A non-empty query is required");
    error.code = "INVALID_REQUEST";
    throw error;
  }

  const apiKey = process.env.OPENROUTESERVICE_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTESERVICE_API_KEY is not configured");
  }

  try {
    const response = await axios.get(
      "https://api.openrouteservice.org/geocode/autocomplete",
      {
        params: {
          text: input.trim(),
          "boundary.country": "IND",
          layers: "venue,address",
          size: 5,
        },
        headers: {
          Authorization: apiKey,
        },
        timeout: 10000,
      }
    );

    const features = response.data?.features;
    if (!Array.isArray(features)) {
      const error = new Error("OpenRouteService returned an invalid response");
      error.code = "PROVIDER_ERROR";
      throw error;
    }

    return features
      .map((feature) => feature?.properties?.label)
      .filter((label) => typeof label === "string" && label.trim());
  } catch (err) {
    if (err.code === "PROVIDER_ERROR") {
      throw err;
    }

    console.error(
      "ORS autocomplete error:",
      err.response?.status,
      err.response?.data || err.message
    );

    const error = new Error("OpenRouteService autocomplete request failed");
    error.code = err.response?.status || "PROVIDER_ERROR";
    throw error;
  }
};

module.exports.getCaptainsInTheRadius = async (lat, lng, radius) => {
  const latitude = Number(lat);
  const longitude = Number(lng);
  const radiusInKm = Number(radius);

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    !Number.isFinite(radiusInKm) ||
    radiusInKm < 0
  ) {
    throw new Error("Latitude, longitude, and a non-negative radius in kilometers are required");
  }

  const earthRadiusInKm = 6371;
  const latitudeDelta = (radiusInKm / earthRadiusInKm) * (180 / Math.PI);
  const minLatitude = Math.max(-90, latitude - latitudeDelta);
  const maxLatitude = Math.min(90, latitude + latitudeDelta);
  const query = {
    "location.lat": { $gte: minLatitude, $lte: maxLatitude },
  };

  const longitudeDelta =
    latitudeDelta >= 180 || Math.abs(latitude) + latitudeDelta >= 90
      ? 180
      : latitudeDelta / Math.cos((latitude * Math.PI) / 180);

  if (longitudeDelta < 180) {
    const minLongitude = longitude - longitudeDelta;
    const maxLongitude = longitude + longitudeDelta;

    if (minLongitude < -180) {
      query.$or = [
        { "location.long": { $gte: minLongitude + 360 } },
        { "location.long": { $lte: maxLongitude } },
      ];
    } else if (maxLongitude > 180) {
      query.$or = [
        { "location.long": { $gte: minLongitude } },
        { "location.long": { $lte: maxLongitude - 360 } },
      ];
    } else {
      query["location.long"] = { $gte: minLongitude, $lte: maxLongitude };
    }
  }

  const captains = await captainModel.find(
    query,
    {
      "location.lat": 1,
      "location.long": 1,
      fullname: 1,
      socketId: 1,
      vehicle: 1,
      status: 1,
    }
  );

  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  return captains.filter((captain) => {
    const captainLat = captain.location.lat;
    const captainLng = captain.location.long;
    const latitudeDifference = toRadians(captainLat - latitude);
    const longitudeDifference = toRadians(captainLng - longitude);
    const haversine = Math.min(
      1,
      Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(toRadians(latitude)) *
          Math.cos(toRadians(captainLat)) *
          Math.sin(longitudeDifference / 2) ** 2
    );
    const distanceInKm =
      2 * earthRadiusInKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

    return distanceInKm <= radiusInKm;
  });
};
