import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/lib/supabaseClient';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type AuthMode = 'login' | 'register' | 'forgotPassword';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');
  const colorScheme = useColorScheme() ?? 'light';
  
  const handleAuth = async () => {
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        else {
          Alert.alert(
            'Registration successful',
            'Check your email for a confirmation link.'
          );
          setMode('login');
        }
      } else if (mode === 'forgotPassword') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        
        if (error) throw error;
        else {
          Alert.alert(
            'Password Reset Email Sent',
            'Check your email for a password reset link.'
          );
          setMode('login');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardAvoid} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ThemedView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <ThemedText type="title" style={styles.title}>
              {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {mode === 'login' ? 'Sign in to continue' : 
               mode === 'register' ? 'Sign up to get started' : 
               'Enter your email to receive a reset link'}
            </ThemedText>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                  color: colorScheme === 'dark' ? '#FFFFFF' : '#000000'
                }
              ]}
              placeholder="Email"
              placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#8E8E93'}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            
            {mode !== 'forgotPassword' && (
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                    color: colorScheme === 'dark' ? '#FFFFFF' : '#000000'
                  }
                ]}
                placeholder="Password"
                placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#8E8E93'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            )}

            <TouchableOpacity
              style={[styles.button, { opacity: loading ? 0.7 : 1 }]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.buttonText}>
                  {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Sign Up' : 'Send Reset Link'}
                </ThemedText>
              )}
            </TouchableOpacity>
            
            {mode === 'login' && (
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => setMode('forgotPassword')}
              >
                <ThemedText style={styles.linkText}>Forgot Password?</ThemedText>
              </TouchableOpacity>
            )}

            <View style={styles.switchModeContainer}>
              <ThemedText>
                {mode === 'login' ? "Don't have an account? " : 
                 mode === 'register' ? "Already have an account? " :
                 "Remember your password? "}
              </ThemedText>
              <TouchableOpacity 
                onPress={() => {
                  if (mode === 'login') setMode('register');
                  else setMode('login');
                }}
              >
                <ThemedText type="link" style={styles.switchModeText}>
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    borderRadius: 8,
    height: 50,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B87FF',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginVertical: 8,
  },
  linkText: {
    fontSize: 14,
  },
  switchModeContainer: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  switchModeText: {
    fontWeight: '600',
  }
});