#!/bin/bash

# Check if the Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "Supabase CLI not found. Please install it first:"
  echo "npm install -g supabase"
  exit 1
fi

# Check if the user is logged in
echo "Checking Supabase login status..."
supabase projects list &> /dev/null
if [ $? -ne 0 ]; then
  echo "Please login to Supabase first:"
  echo "supabase login"
  exit 1
fi

# Deploy the OpenAI proxy function
echo "Deploying openai-proxy function..."
supabase functions deploy openai-proxy

# Deploy the OpenAI vision function
echo "Deploying openai-vision function..."
supabase functions deploy openai-vision

# Enable JWT verification for both functions (this is default, but we'll set it explicitly)
echo "Enabling JWT verification for all functions..."
# We're not including --no-verify-jwt anymore, letting Supabase use the default JWT verification

echo "Deployment complete! Both functions are now ready to use."
echo ""
echo "Make sure you've added these environment variables to your Supabase functions:"
echo "- OPENAI_API_KEY: Your OpenAI API key"
echo "- SUPABASE_URL: Your Supabase project URL (automatically added by Supabase)"
echo "- SUPABASE_ANON_KEY: Your Supabase anonymous key (automatically added by Supabase)"
echo "- SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key (must be added manually)"
echo ""
echo "You can add the service role key using:"
echo "supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key" 