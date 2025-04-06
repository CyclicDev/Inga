import React from 'react';
import { StyleSheet, TouchableOpacity, Alert, Image, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for icons
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

  if (!fontsLoaded) {
    return null; // Wait for fonts to load
  }

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

  const createJsonPayload = (base64Image: string) => {
    return {
      image: base64Image,
      timestamp: new Date().toISOString(),
      metadata: {
        description: 'Scanned document',
        userId: '12345',
      },
    };
  };

  const handleScanFile = async () => {
    try {
      const scannedImages: string[] = []; // Array to store Base64 strings of scanned images

      const scanImage = async (): Promise<void> => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera access is required to scan documents.');
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });

        if (!result.canceled) {
          const base64Image = await convertImageToBase64(result.assets[0].uri);
          if (base64Image) {
            scannedImages.push(base64Image); // Add the scanned image to the array
          }

          // Prompt the user to scan another image
          return new Promise<void>((resolve) => {
            Alert.alert(
              'Scan Another?',
              'Do you want to scan another image?',
              [
                { text: 'No', onPress: () => resolve() }, // Finish scanning
                { text: 'Yes', onPress: async () => await scanImage().then(resolve) }, // Scan another image
              ]
            );
          });
        } else {
          console.log('User canceled the scan');
        }
      };

      await scanImage(); // Start the scanning process

      // Ensure JSON payloads are created after all images are scanned
      if (scannedImages.length > 0) {
        const jsonPayloads = scannedImages.map((image, index) => ({
          image,
          timestamp: new Date().toISOString(),
          metadata: {
            description: `Scanned document ${index + 1}`,
            userId: '12345',
          },
        }));

        // Log each JSON payload individually
        jsonPayloads.forEach((payload, index) => {
          //console.log(`Payload ${index + 1}:`, payload);
        });

        Alert.alert('Success', `${scannedImages.length} images processed and JSON payloads created!`);
      } else {
        console.log('No images were scanned.');
      }
    } catch (error) {
      console.error('Error during document scanning:', error);
      Alert.alert('Error', 'An unexpected error occurred while scanning the document.');
    }
  };

  const handleUploadFile = () => {
    console.log('Upload File button pressed');
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/images/Ignalogo.png')}
        style={styles.logo}
      />

      {/* Description */}
      <Text style={styles.description}>
        Effortlessly scan and fill health forms with the help of Igna, your AI assistant nurse
      </Text>

      {/* Scan Button */}
      <TouchableOpacity
        style={styles.scanFileButton}
        onPress={handleScanFile}
        activeOpacity={0.8}
      >
        <Text style={styles.scanFileButtonText}>Scan File</Text>
      </TouchableOpacity>

      {/* Upload Button */}
      <TouchableOpacity
        style={styles.uploadFileButton}
        onPress={handleUploadFile}
        activeOpacity={0.8}
      >
        <Text style={styles.uploadFileButtonText}>Upload File</Text>
      </TouchableOpacity>
    </View>
  );
}

function DocumentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.description}>This is the Documents Screen</Text>
    </View>
  );
}

export default function App() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: string } }): BottomTabNavigationOptions => ({
        tabBarActiveTintColor: '#636ae8',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#FFFFFF' },
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          let iconName: 'home' | 'document-text' | undefined;

          if (route.name === 'Home') {
            iconName = 'home'; // Icon for Home tab
          } else if (route.name === 'Documents') {
            iconName = 'document-text'; // Icon for Documents tab
          }

          return <Ionicons name={iconName as 'home' | 'document-text'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Documents" component={DocumentsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 15,
    resizeMode: 'contain',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 30,
  },
  scanFileButton: {
    backgroundColor: '#636ae8',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
    marginBottom: 10,
  },
  scanFileButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  uploadFileButton: {
    backgroundColor: '#636ae8',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
  },
  uploadFileButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});