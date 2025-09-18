import dotenv from "dotenv";
import path from "path";

// Only load .env file in non-production environments
if (process.env.NODE_ENV !== "production") {
  console.log("Loading .env file for development...");
  const __dirname = path.resolve(path.dirname(""));
  const envPath = path.resolve(__dirname, ".env");
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.error("FATAL ERROR: .env file not found or failed to load.");
    throw result.error;
  }
} else {
  console.log("Running in production mode. Using environment variables from host.");
}
