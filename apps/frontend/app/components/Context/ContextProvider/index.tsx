"use client";
import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  message: string;
  creatorId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface Notification {
  id: string;
  type: 'join' | 'message' | 'viewed';
  userId?: string;
  messageId?: string;
  status: 'received' | 'viewed';
  timestamp: string;
}

interface ChatState {
  socket: Socket | null;
  isConnected: boolean;
  messages: Message[];
  roomId: string | null;
  creatorId: string | null;
  notifications: Notification[];
}

type ChatAction =
  | { type: 'SET_SOCKET'; payload: Socket | null }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_ROOM_ID'; payload: string | null }
  | { type: 'SET_CREATOR_ID'; payload: string | null }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION_STATUS'; payload: { id: string; status: 'received' | 'viewed' } };

const initialState: ChatState = {
  socket: null,
  isConnected: false,
  messages: [],
  roomId: null,
  creatorId: null,
  notifications: [],
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_SOCKET':
      return { ...state, socket: action.payload };
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_ROOM_ID':
      return { ...state, roomId: action.payload };
    case 'SET_CREATOR_ID':
      return { ...state, creatorId: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'UPDATE_NOTIFICATION_STATUS':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload.id ? { ...n, status: action.payload.status } : n
        ),
      };
    default:
      return state;
  }
};

const ChatContext = createContext<{
  state: ChatState;
  connectWebSocket: (url: string, creatorId: string) => void;
  joinRoom: (roomId: string) => void;
  sendMessage: (message: string) => void;
  markNotificationAsViewed: (notificationId: string) => void;
  disconnectWebSocket: () => void;
}>({
  state: initialState,
  connectWebSocket: () => { },
  joinRoom: () => { },
  sendMessage: () => { },
  markNotificationAsViewed: () => { },
  disconnectWebSocket: () => { },
});

export const SocketContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef(false); // Track if connection is in progress
  const lastConnectionAttemptRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = (url: string, creatorId: string) => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastConnectionAttemptRef.current;
    const MIN_RECONNECTION_DELAY = 5000; // 5 seconds between connection attempts

    if (socketRef.current?.connected) {
      console.log('Socket already connected');
      return;
    }

    if (isConnectingRef.current) {
      console.log('Connection already in progress');
      return;
    }

    if (timeSinceLastAttempt < MIN_RECONNECTION_DELAY) {
      console.log('Connection throttled. Waiting before retry...');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket(url, creatorId);
      }, MIN_RECONNECTION_DELAY - timeSinceLastAttempt);

      return;
    }

    isConnectingRef.current = true;
    lastConnectionAttemptRef.current = now;
    console.log('Initiating socket connection...');

    try {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }

      socketRef.current = io(url, {
        query: { userId: creatorId },
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        transports: ['websocket']
      });

      dispatch({ type: 'SET_CREATOR_ID', payload: creatorId });

      socketRef.current.on('connect', () => {
        console.log('Socket connected successfully');
        dispatch({ type: 'SET_SOCKET', payload: socketRef.current });
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
        isConnectingRef.current = false;
      });

      socketRef.current.on('chatHistory', (chatHistory: Message[]) => {
        console.log('Received chat history');
        dispatch({ type: 'SET_MESSAGES', payload: chatHistory });
      });

      socketRef.current.on('newMessage', (newMessage: Message) => {
        dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
      });

      socketRef.current.on('notification', (notification: Notification) => {
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });

        // Only attempt reconnect for certain disconnect reasons
        if (reason === 'io server disconnect' || reason === 'transport close') {
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket(url, creatorId);
          }, MIN_RECONNECTION_DELAY);
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        isConnectingRef.current = false;

        // Schedule a single reconnection attempt
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket(url, creatorId);
        }, MIN_RECONNECTION_DELAY);
      });
    } catch (error) {
      console.error('Error in connectWebSocket:', error);
      isConnectingRef.current = false;
    }
  };


  const joinRoom = (roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinRoom', { roomId });
      dispatch({ type: 'SET_ROOM_ID', payload: roomId });

      // Notify others in the room that a new user has joined
      socketRef.current.emit('notifyJoin', { roomId, userId: state.creatorId });
    }
  };

  const sendMessage = (message: string) => {
    if (socketRef.current?.connected && state.roomId && state.creatorId) {
      const payload = {
        message,
        creatorId: state.creatorId,
        roomId: state.roomId,
      };
      socketRef.current.emit('sendMessage', payload);
    } else {
      console.error('WebSocket is not connected or roomId/creatorId is missing');
    }
  };

  const markNotificationAsViewed = (notificationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('markNotificationAsViewed', { notificationId });
    }
  };

  const disconnectWebSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      console.log('Disconnecting socket...');
      socketRef.current.removeAllListeners();
      socketRef.current.close();
      socketRef.current = null;
      dispatch({ type: 'SET_SOCKET', payload: null });
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
      isConnectingRef.current = false;
    }
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        disconnectWebSocket();
      }
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      state,
      connectWebSocket,
      joinRoom,
      sendMessage,
      markNotificationAsViewed,
      disconnectWebSocket,
    }),
    [state]
  );
  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);