# Inga

This is an experimental voice assistant. Created for DiamondHacks 2025.

## Architecture

Inga uses a secure architecture where:

1. The mobile app handles UI and user interactions
2. Supabase provides:
   - Database for storing documents and chat history
   - Storage for document images
   - Edge Functions that securely proxy requests to OpenAI (keeping API keys secure)
   - Authentication for securing all operations

### Supabase Functions

The app uses two Supabase Edge Functions to communicate with OpenAI:

- `openai-proxy`: Handles standard text-based chat messages
- `openai-vision`: Handles messages containing both text and images (for document analysis)

### Security Features

- **Authentication Required**: All API requests require valid Supabase authentication
- **Server-side API Keys**: OpenAI API keys are stored securely on the server side
- **Signed URLs**: Images are accessed via temporary signed URLs for enhanced security
- **User Isolation**: Each user can only access their own documents and chats

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Add environment variables to the .env file

3. Deploy Supabase Functions (if using your own Supabase project)
   ```bash
   cd supabase/functions
   chmod +x deploy.sh
   ./deploy.sh
   ```

   You'll need to set these secrets for the functions:
   ```bash
   supabase secrets set OPENAI_API_KEY=your-openai-api-key
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).
