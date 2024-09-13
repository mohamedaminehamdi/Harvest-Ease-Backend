import dotenv from "dotenv";

dotenv.config({ quiet: true });

// Fail fast at boot instead of erroring on the first request that needs them
const missing = ["DB_URI", "JWT_SECRET"].filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}
