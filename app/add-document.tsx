import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { createDocument } from '../lib/documents.service.ts';

// Sample user ID - in a real app, you'd get this from authentication
const SAMPLE_USER_ID = '12345';

export default function AddDocumentScreen() {
  const [documentName, setDocumentName] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const pickImages = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to pick images.');
        return;
      }
      
      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
        base64: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Get the selected images as base64
        const selectedImages = await Promise.all(
          result.assets.map(async (asset) => {
            // If base64 is not included in the result, read it manually
            if (!asset.base64) {
              const base64 = await FileSystem.readAsStringAsync(asset.uri, {
                encoding: FileSystem.EncodingType.Base64,
              });
              return `data:image/jpeg;base64,${base64}`;
            }
            return `data:image/jpeg;base64,${asset.base64}`;
          })
        );
        
        setImages([...images, ...selectedImages]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };
  
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  
  const handleSave = async () => {
    if (!documentName.trim()) {
      Alert.alert('Required', 'Please enter a document name');
      return;
    }
    
    if (images.length === 0) {
      Alert.alert('Required', 'Please add at least one image');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const document = await createDocument(documentName, images, SAMPLE_USER_ID);
      
      if (!document) {
        throw new Error('Failed to create document');
      }
      
      Alert.alert('Success', 'Document created successfully', [
        { 
          text: 'OK', 
          onPress: () => router.back() 
        }
      ]);
    } catch (error) {
      console.error('Error creating document:', error);
      Alert.alert('Error', 'Failed to create document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Add Document',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Document Name</Text>
            <TextInput
              style={styles.input}
              value={documentName}
              onChangeText={setDocumentName}
              placeholder="Enter document name"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Images</Text>
            <TouchableOpacity style={styles.addImagesButton} onPress={pickImages}>
              <Ionicons name="images-outline" size={24} color="#636ae8" />
              <Text style={styles.addImagesButtonText}>Add Images</Text>
            </TouchableOpacity>
            
            {images.length > 0 && (
              <View style={styles.imageList}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.image} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#ff6b6b" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.saveButton, (!documentName.trim() || images.length === 0) && styles.disabledButton]}
            onPress={handleSave}
            disabled={!documentName.trim() || images.length === 0 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="white" />
                <Text style={styles.saveButtonText}>Save Document</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  addImagesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 106, 232, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#636ae8',
  },
  addImagesButtonText: {
    fontSize: 16,
    color: '#636ae8',
    marginLeft: 8,
  },
  imageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  imageContainer: {
    width: '31%',
    aspectRatio: 1,
    marginBottom: 12,
    marginRight: '2%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#636ae8',
    borderRadius: 8,
    padding: 16,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 