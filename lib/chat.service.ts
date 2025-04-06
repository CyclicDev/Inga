import { Document } from './documents.service.js';
import { supabase } from './supabaseClient.ts';
import Constants from 'expo-constants';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; [key: string]: any }>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  documentId?: string;
}

// Function to start a new chat with a document (if provided)
export async function startDocumentChat(document?: Document): Promise<ChatSession> {
  const systemMessage: Message = {
    role: 'system',
    content: document 
      ? 'You are a helpful assistant analyzing document images. Help the user understand and extract information from these documents.'
      : 'You are a helpful assistant. Respond to the user\'s questions concisely and accurately.'
  };
  
  const initialMessages: Message[] = [systemMessage];
  
  // If document is provided, add document images to context
  if (document && document.images.length > 0) {
    const imageMessages: Array<{ type: string; image_url: { url: string } }> = 
      document.images.map(imageUrl => ({
        type: 'image_url',
        image_url: { url: imageUrl }
      }));
    
    const userMessage: Message = {
      role: 'user',
      content: [
        { type: 'text', text: `I'd like to discuss this document titled "${document.name}".` },
        ...imageMessages
      ]
    };
    
    initialMessages.push(userMessage);
  }
  
  return {
    id: Date.now().toString(),
    title: document?.name || 'New Chat',
    messages: initialMessages,
    documentId: document?.id
  };
}

// Function to send a message to OpenAI API through Supabase function
export async function sendMessage(chatSession: ChatSession, userMessage: string): Promise<ChatSession> {
  try {
    // Add user message to the chat
    const updatedMessages: Message[] = [
      ...chatSession.messages, 
      { 
        role: 'user' as const, 
        content: userMessage 
      }
    ];
    
    // Check if any message contains images to determine which function to use
    const hasImages = updatedMessages.some(msg => 
      Array.isArray(msg.content) && 
      msg.content.some(item => item.type === 'image_url')
    );
    
    // Call the appropriate Supabase function based on content
    const functionName = hasImages ? 'openai-vision' : 'openai-proxy';
    
    // Get the current session auth token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('User is not authenticated. Please sign in to continue.');
    }
    
    // Call OpenAI API through Supabase function with authentication
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: {
        messages: updatedMessages,
        model: 'gpt-4o', // Vision model that can understand images
        max_tokens: 500,
        temperature: 0.7,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    
    if (error) {
      throw new Error(`Error calling Supabase function: ${error.message}`);
    }
    
    // Get the assistant's response
    const assistantMessage = data.choices[0].message;
    
    // Add the assistant's response to the messages
    updatedMessages.push({
      role: 'assistant',
      content: assistantMessage.content || ''
    });
    
    // Return the updated chat session
    return {
      ...chatSession,
      messages: updatedMessages
    };
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Add an error message to the chat
    const errorMessage: Message = {
      role: 'assistant',
      content: 'I apologize, but I encountered an error processing your request. Please try again.'
    };
    
    return {
      ...chatSession,
      messages: [...chatSession.messages, { role: 'user', content: userMessage }, errorMessage]
    };
  }
} 