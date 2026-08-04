import dns from "node:dns";

/**
 * Prefer public DNS resolvers for MongoDB Atlas SRV lookups.
 * Imported first from the backend entry point so this runs before any
 * MongoDB connection (and before other app modules initialize).
 * Replaces the need for: $env:NODE_OPTIONS="--require=..."
 */
dns.setServers(["1.1.1.1", "8.8.8.8"]);
