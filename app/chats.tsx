import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { startDocumentChat } from '../lib/chat.service.ts';
import { supabase } from '../lib/supabaseClient.ts';

// Interface for Chat type
interface Chat {
  id: string;
  title: string;
  updated_at: string;
  document_id?: string;
  user_id: string;
}

// Sample user ID - in a real app, you would get this from authentication
const SAMPLE_USER_ID = '12345';

export default function ChatsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      // Fetch chats from local storage or from a server
      // For now, we'll simulate by getting them from Supabase
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', SAMPLE_USER_ID)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      setChats(data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    // Create a new empty chat
    const newChat = await startDocumentChat();
    
    // Navigate to the chat screen
    router.push({
      pathname: '/chat/[id]',
      params: { id: newChat.id, isNew: 'true' }
    });
  };

  const handleChatPress = (chatId: string) => {
    router.push({
      pathname: '/chat/[id]',
      params: { id: chatId }
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#636ae8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats</Text>
      
      <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
        <Ionicons name="add-circle" size={24} color="white" />
        <Text style={styles.newChatButtonText}>New Chat</Text>
      </TouchableOpacity>
      
      {chats.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubble-ellipses-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No chats yet</Text>
          <Text style={styles.emptyStateSubText}>
            Start a new chat or create one from a document
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() => handleChatPress(item.id)}
            >
              <View style={styles.chatIcon}>
                <Ionicons 
                  name={item.document_id ? "document-text" : "chatbubble-ellipses"} 
                  size={24} 
                  color="#636ae8" 
                />
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.chatTitle}>{item.title}</Text>
                <Text style={styles.chatTimestamp}>
                  {new Date(item.updated_at).toLocaleDateString()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.chatsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#636ae8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  newChatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  chatsList: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
  },
  chatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 106, 232, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  chatTimestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginTop: 16,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
  },
}); 