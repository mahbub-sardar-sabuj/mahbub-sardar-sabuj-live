// Diagnostic endpoint to test module loading on Vercel
export default async function handler(req, res) {
  const results = {};

  // Test 1: Can we import @trpc/server?
  try {
    await import("@trpc/server");
    results.trpc = "OK";
  } catch (e) {
    results.trpc = "ERROR: " + e.message.slice(0, 150);
  }

  // Test 2: Can we import drizzle-orm/mysql2?
  try {
    await import("drizzle-orm/mysql2");
    results.drizzle = "OK";
  } catch (e) {
    results.drizzle = "ERROR: " + e.message.slice(0, 150);
  }

  // Test 3: Can we import superjson?
  try {
    await import("superjson");
    results.superjson = "OK";
  } catch (e) {
    results.superjson = "ERROR: " + e.message.slice(0, 150);
  }

  // Test 4: Can we import jose?
  try {
    await import("jose");
    results.jose = "OK";
  } catch (e) {
    results.jose = "ERROR: " + e.message.slice(0, 150);
  }

  // Test 5: ENV vars
  results.env = {
    JWT_SECRET: process.env.JWT_SECRET ? "SET" : "MISSING",
    DATABASE_URL: process.env.DATABASE_URL ? "SET" : "MISSING",
    VITE_APP_ID: process.env.VITE_APP_ID ? "SET" : "MISSING",
    OAUTH_SERVER_URL: process.env.OAUTH_SERVER_URL ? "SET" : "MISSING",
    NODE_ENV: process.env.NODE_ENV || "not set",
  };

  res.status(200).json(results);
}
