# OpenAI Vision Function

This Supabase Edge Function handles interactions with OpenAI's vision-capable models, allowing clients to send messages that include both text and images. The function verifies user authentication and automatically generates signed URLs for Supabase storage images.

## Overview

The function is specifically designed for secure document-based chats where image analysis is required:
- It verifies the user's JWT token
- It automatically detects Supabase storage URLs
- It converts public URLs to signed URLs for secure access
- It provides these signed URLs to OpenAI

## Deployment

Follow these deployment steps:

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project (if not already linked):
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Set your OpenAI API key and Supabase service role key as secrets:
   ```bash
   supabase secrets set OPENAI_API_KEY=your-openai-api-key
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

5. Deploy the function:
   ```bash
   supabase functions deploy openai-vision
   ```

## Usage

The function requires an authenticated request with a valid JWT token. Send a POST request with:

### Headers
```
Authorization: Bearer <user-jwt-token>
```

### Body
```json
{
  "messages": [
    { "role": "system", "content": "You are a helpful assistant analyzing document images." },
    { 
      "role": "user", 
      "content": [
        { "type": "text", "text": "What's in this document?" },
        { "type": "image_url", "image_url": { "url": "https://example.com/image.jpg" } }
      ] 
    }
  ],
  "model": "gpt-4o",
  "max_tokens": 500,
  "temperature": 0.7
}
```

## Security Features

- **Authentication Required**: All requests must include a valid Supabase JWT token
- **Server-side API Key**: OpenAI API key is stored securely as a Supabase secret
- **User Verification**: The function verifies the user is authenticated before processing any requests
- **Signed URLs**: Images stored in Supabase storage are accessed via temporary signed URLs
- **URL Transformation**: The function automatically converts public Supabase URLs to signed URLs 