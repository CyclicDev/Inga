import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createAdminClient } from 'https://esm.sh/@supabase/supabase-js@2/dist/module/index.js';

// Supabase configuration - replace with your actual values
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

async function generateAuthTokenWithAdminSDK(email: string, password: string): Promise<string | null> {
    try {
        const adminClient = createAdminClient({
            supabaseUrl: SUPABASE_URL,
            supabaseKey: SUPABASE_SERVICE_ROLE_KEY,
        });

        // Sign up the user
        const { data, error } = await adminClient.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            console.error('Error signing up user:', error);
            return null;
        }

        const userId = data.user?.id;

        if (!userId) {
            console.error('User ID not found after signup.');
            return null;
        }

        // Generate a new auth token for the user
        const { data: tokenData, error: tokenError } = await adminClient.auth.generateLink({
            type: 'magiclink',
            email: email,
            options: {
                redirectTo: 'http://localhost:8000', // Replace with your redirect URL
            },
        });

        if (tokenError) {
            console.error('Error generating auth token:', tokenError);
            return null;
        }

        if (!tokenData.properties?.token) {
            console.error('Token not found in the response.');
            return null;
        }

        // Delete the user after generating the token
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

        if (deleteError) {
            console.error('Error deleting user:', deleteError);
        }

        return tokenData.properties.token;
    } catch (error) {
        console.error('Error in generateAuthTokenWithAdminSDK:', error);
        return null;
    }
}

async function generateAuthTokenWithClientSDK(email: string, password: string): Promise<string | null> {
    try {
        const client: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: false,
            },
        });

        // Sign up the user
        const { data: signUpData, error: signUpError } = await client.auth.signUp({
            email: email,
            password: password,
        });

        if (signUpError) {
            console.error('Error signing up user:', signUpError);
            return null;
        }

        // Sign in the user to get the session
        const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (signInError) {
            console.error('Error signing in user:', signInError);
            // Delete the user after failing to sign in
            if (signUpData.user?.id) {
                await deleteUser(signUpData.user.id);
            }
            return null;
        }

        const token = signInData.session?.access_token;

        if (!token) {
            console.error('Access token not found after signing in.');
            // Delete the user if token is not found
            if (signUpData.user?.id) {
                await deleteUser(signUpData.user.id);
            }
            return null;
        }

        // Delete the user after generating the token
        if (signUpData.user?.id) {
            await deleteUser(signUpData.user.id);
        }

        return token;
    } catch (error) {
        console.error('Error in generateAuthTokenWithClientSDK:', error);
        return null;
    }
}

async function deleteUser(userId: string): Promise<void> {
    try {
        const adminClient = createAdminClient({
            supabaseUrl: SUPABASE_URL,
            supabaseKey: SUPABASE_SERVICE_ROLE_KEY,
        });

        const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

        if (deleteError) {
            console.error('Error deleting user:', deleteError);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

async function main(MODE: string) {
    const email = 'test@inga.app';
    const password = 'password';

    if (MODE == "admin") {
        console.log('Generating auth token with Admin SDK...');
        const adminToken = await generateAuthTokenWithAdminSDK(email, password);
        if (adminToken) {
            console.log('Admin SDK Auth Token:', adminToken);
        } else {
            console.error('Failed to generate auth token with Admin SDK.');
        }
    }


    if (MODE == "client") {
        console.log('Generating auth token with Client SDK...');
        const clientToken = await generateAuthTokenWithClientSDK(email, password);
        if (clientToken) {
            console.log('Client SDK Auth Token:', clientToken);
        } else {
            console.error('Failed to generate auth token with Client SDK.');
        }
    }

}


main(Deno.args[0] || "client");