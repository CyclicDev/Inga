# OpenAI Proxy Supabase Function

This Supabase Edge Function serves as a secure proxy for OpenAI API requests, allowing clients to communicate with OpenAI without exposing API keys in the client-side code. The function verifies user authentication before processing requests.

## Deployment

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
   supabase functions deploy openai-proxy
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
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello, how are you?" }
  ],
  "model": "gpt-4o",
  "max_tokens": 500,
  "temperature": 0.7
}
```

The response will be the OpenAI API response in JSON format.

## Security Features

- **Authentication Required**: All requests must include a valid Supabase JWT token
- **Server-side API Key**: OpenAI API key is stored securely as a Supabase secret
- **User Verification**: The function verifies the user is authenticated before processing any requests

## Security Considerations

- This function uses `--no-verify-jwt` to allow public access. For production, consider requiring JWT authentication.
- Store your OpenAI API key securely as a Supabase secret.
- Consider adding rate limiting for production use. 