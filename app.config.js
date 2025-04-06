module.exports = {
  name: 'Inga',
  version: '1.0.0',
  extra: {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  },
  plugins: [
    'expo-font', // Add the expo-font plugin here
  ],
};