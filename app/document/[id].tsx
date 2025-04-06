import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { getDocumentById, Document } from '../../lib/documents.service.ts';
import { startDocumentChat } from '../../lib/chat.service.ts';
import { supabase } from '../../lib/supabaseClient.ts'; // Import Supabase client

const { width } = Dimensions.get('window');

export default function DocumentDetailScreen() {
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [signedImageUrls, setSignedImageUrls] = useState<string[]>([]);
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    loadDocument();
  }, []);

  const loadDocument = async () => {
    try {
      setIsLoading(true);
      const doc = await getDocumentById(params.id);
      if (doc) {
        setDocument(doc);
        if (doc.images && doc.images.length > 0) {
          await generateSignedUrls(doc.images);
        }
      } else {
        Alert.alert('Error', 'Document not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading document:', error);
      Alert.alert('Error', 'Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSignedUrls = async (imageUrls: string[]) => {
    try {
      const signedUrls = await Promise.all(
        imageUrls.map(async (imageUrl) => {
          // Check if this is a Supabase storage URL
          if (imageUrl.includes('/storage/v1/object/public/')) {
            try {
              // Extract the path from the URL
              // Format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
              const urlObj = new URL(imageUrl);
              const pathParts = urlObj.pathname.split('/storage/v1/object/public/');
              
              if (pathParts.length === 2) {
                const bucketAndPath = pathParts[1];
                // First segment is bucket name, rest is file path
                const [bucket, ...pathSegments] = bucketAndPath.split('/');
                const filePath = pathSegments.join('/');
                
                // Create a signed URL with 1 hour expiry
                const { data, error } = await supabase.storage
                  .from(bucket)
                  .createSignedUrl(filePath, 60 * 60);
                
                if (error) {
                  console.error('Error creating signed URL:', error);
                  return imageUrl; // Fallback to original URL
                }
                
                // Return the signed URL if successful, otherwise fall back to original URL
                return data?.signedUrl || imageUrl;
              }
            } catch (error) {
              console.error('Error creating signed URL:', error);
            }
          }
          
          // Return original URL if not a Supabase URL or if signing failed
          return imageUrl;
        })
      );
      
      setSignedImageUrls(signedUrls);
    } catch (error) {
      console.error('Error generating signed URLs:', error);
      // Fallback to original URLs
      setSignedImageUrls(imageUrls);
    }
  };

  const handleChatWithDocument = async () => {
    if (!document) return;
    
    try {
      const chatSession = await startDocumentChat(document);
      router.push({
        pathname: '/chat/[id]',
        params: { id: chatSession.id, isNew: 'true' }
      });
    } catch (error) {
      console.error('Error starting chat with document:', error);
      Alert.alert('Error', 'Failed to start chat with this document');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#636ae8" />
      </View>
    );
  }

  if (!document) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Document not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: document.name,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleChatWithDocument} style={styles.headerButton}>
              <Ionicons name="chatbubble" size={24} color="#636ae8" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.container}>
        {document.images && document.images.length > 0 ? (
          <>
            <View style={styles.mainImageContainer}>
              <Image 
                source={{ uri: signedImageUrls[selectedImageIndex] || document.images[selectedImageIndex] }} 
                style={styles.mainImage}
                resizeMode="contain"
              />
            </View>
            
            {document.images.length > 1 && (
              <FlatList
                data={document.images}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[
                      styles.thumbnailContainer,
                      selectedImageIndex === index && styles.selectedThumbnail
                    ]}
                    onPress={() => setSelectedImageIndex(index)}
                  >
                    <Image 
                      source={{ uri: signedImageUrls[index] || item }} 
                      style={styles.thumbnail} 
                    />
                  </TouchableOpacity>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailList}
              />
            )}
            
            <View style={styles.infoContainer}>
              <Text style={styles.imageCounter}>
                Image {selectedImageIndex + 1} of {document.images.length}
              </Text>
              <Text style={styles.dateText}>
                Created on {new Date(document.created_at).toLocaleDateString()}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.noImagesContainer}>
            <Ionicons name="images-outline" size={64} color="#ccc" />
            <Text style={styles.noImagesText}>No images in this document</Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ff6b6b',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#636ae8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButton: {
    padding: 8,
  },
  mainImageContainer: {
    height: width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailList: {
    padding: 12,
  },
  thumbnailContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderColor: '#636ae8',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
  },
  imageCounter: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#777',
  },
  noImagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noImagesText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});