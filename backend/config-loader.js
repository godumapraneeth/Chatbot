// config-loader.js

import dotenv from "dotenv";
import path from "path";

// Create an absolute path to the .env file.
const __dirname = path.resolve(path.dirname(''));
const envPath = path.resolve(__dirname, '.env');

// Load the .env file from the explicit path.
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("❌ FATAL ERROR: .env file not found or failed to load.");
  throw result.error;
}

console.log("✅ Environment variables loaded successfully.");