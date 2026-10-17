const configuredOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  ...(process.env.FRONTEND_URLS || "").split(","),
]
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin, callback) => {
  if (!origin || configuredOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    try {
      const parsedOrigin = new URL(origin);
      if (
        parsedOrigin.protocol === "https:" &&
        parsedOrigin.hostname.endsWith(".devtunnels.ms")
      ) {
        callback(null, true);
        return;
      }
    } catch {
      callback(new Error("Invalid origin"));
      return;
    }
  }

  callback(new Error(`Origin ${origin} is not allowed by CORS`));
};

module.exports = {
  origin: isAllowedOrigin,
  credentials: true,
};
