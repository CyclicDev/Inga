import 'expo-constants';

declare module 'expo-constants' {
  interface Constants {
    expoConfig?: {
      extra?: {
        supabaseUrl?: string;
        supabaseAnonKey?: string;
        openaiApiKey?: string;
      };
    };
  }
} 