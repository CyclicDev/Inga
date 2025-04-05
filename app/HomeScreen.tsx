import React from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  // Function to convert image to Base64
  const convertImageToBase64 = async (uri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Error converting image to Base64:', error);
      Alert.alert('Error', 'Failed to process the image.');
      return null;
    }
  };

  // Function to create a JSON object
  const createJsonPayload = (base64Image: string) => {
    return {
      image: base64Image,
      timestamp: new Date().toISOString(),
      metadata: {
        description: 'Scanned document',
        userId: '12345', // Example user ID
      },
    };
  };

  // Function to handle scanning a file
  const handleScanFile = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to scan documents.');
        return;
      }

      // Launch the camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1, // Highest quality
      });

      if (!result.canceled) {
        const base64Image = await convertImageToBase64(result.assets[0].uri);
        if (base64Image) {
          const jsonPayload = createJsonPayload(base64Image);
          console.log('JSON Payload:', jsonPayload);
          Alert.alert('Success', 'Image processed and JSON created!');
        }
      } else {
        console.log('User canceled the scan');
      }
    } catch (error) {
      console.error('Error during document scanning:', error);
      Alert.alert('Error', 'An unexpected error occurred while scanning the document.');
    }
  };

  const handleUploadFile = () => {
    // Placeholder for file upload logic
    console.log('Upload File button pressed');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Home Screen
      </ThemedText>
      <TouchableOpacity
        style={styles.scanFileButton}
        onPress={handleScanFile}
        activeOpacity={0.8}
      >
        <ThemedText style={styles.scanFileButtonText}>Scan File</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.uploadFileButton}
        onPress={handleUploadFile}
        activeOpacity={0.8}
      >
        <ThemedText style={styles.uploadFileButtonText}>Upload File</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    marginBottom: 20,
  },
  scanFileButton: {
    backgroundColor: '#5B87FF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10, // Add spacing between buttons
  },
  scanFileButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  uploadFileButton: {
    backgroundColor: '#FF7043',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadFileButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});