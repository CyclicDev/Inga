import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configuration
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Test user credentials
const TEST_EMAIL = "test@inga.app";
const TEST_PASSWORD = "password";

/**
 * Generate an auth token using the Supabase Client SDK
 * This approach simulates a regular login with email/password
 */
async function generateTokenWithClientSDK(): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing Supabase URL or anon key");
    return null;
  }
  
  try {
    // Create client
    const supabaseClient = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    // Sign in with email and password
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    
    if (error) {
      console.error("Client SDK error:", error.message);
      return null;
    }
    
    console.log("Successfully generated token with Client SDK");
    return data.session.access_token;
  } catch (error) {
    console.error("Error generating token with Client SDK:", error);
    return null;
  }
}

// Main function to run both methods
async function main() {
  console.log("Generating Supabase auth tokens for", TEST_EMAIL);
  
  console.log("\n=== Client SDK Method ===");
  const clientToken = await generateTokenWithClientSDK();
  if (clientToken) {
    console.log("Token:", clientToken);
  }
}

// Run the main function if this file is executed directly
if (import.meta.main) {
  main();
}