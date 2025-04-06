import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AuthScreen from '@/components/Auth/AuthScreen';

export default function Auth() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack.Screen options={{ 
        title: 'Sign In',
        headerShown: false,
      }} />
      <AuthScreen />
    </>
  );
}