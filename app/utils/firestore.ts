import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}
interface Feedback {
  userId: string;
  name: string;
  rating: number;
  comment: string;
  timestamp: Date;
}


export const createConversation = async (userId: string) => {
  try {
    const newConversation = {
      userId,
      messages: [],
      title: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const docRef = await addDoc(collection(db, 'conversations'), newConversation);
    return docRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

export const saveMessage = async (conversationId: string, message: any) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const currentMessages = await getMessages(conversationId);

    if (currentMessages.length === 0 && message.sender === 'user') {
      const title = await generateAITitle(message.text);
      await updateDoc(conversationRef, {
        title: title,
        messages: [message],
        updatedAt: new Date()
      });
    } else {
      await updateDoc(conversationRef, {
        messages: [...currentMessages, message],
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};
async function generateAITitle(firstMessage: string): Promise<string> {
  try {
    const response = await fetch('/api/generate-title', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Create a concise title for a conversation. Here is the first message in the conversation: "${firstMessage}"`
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate title: ${response.status}`);
    }

    const data = await response.json();
    return data.title;
  } catch (error) {
    console.error('Error generating AI title:', error);
    return 'Untitled Conversation';
  }
}

export const getMessages = async (conversationId: string) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    if (conversationSnap.exists()) {
      return conversationSnap.data()?.messages || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

export const deleteConversation = async (conversationId: string) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await deleteDoc(conversationRef);
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const q = query(collection(db, 'conversations'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled',
        lastMessage: data.messages?.[data.messages.length - 1]?.text || '',
        timestamp: data.updatedAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
};

export const saveFeedback = async (feedback: Feedback) => {
  try {
    const docRef = await addDoc(collection(db, 'feedback'), feedback);
    console.log('Feedback saved with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving feedback:', error);
    throw error;
  }
};