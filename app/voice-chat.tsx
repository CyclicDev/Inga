import React, { useState } from 'react';
import { VoiceChat } from '../components/VoiceChat';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function VoiceChatScreen() {
  const router = useRouter();
  
  const handleClose = () => {
    router.back();
  };
  
  return (
    <>
      <StatusBar style="light" />
      <Stack.Screen 
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'fade',
        }} 
      />
      <VoiceChat onClose={handleClose} />
    </>
  );
} 