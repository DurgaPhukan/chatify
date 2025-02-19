"use client"
import React, { ReactNode, useEffect } from 'react'
import { useChat } from '../Context/ContextProvider';
import { useRouter } from 'next/navigation';

const SocketConnectionProvider = () => {
  const router = useRouter();
  const {
    state: { socket, isConnected, messages, roomId, creatorId, notifications },
    connectWebSocket,
    sendMessage,
    markNotificationAsViewed,
    disconnectWebSocket,
  } = useChat();

  const getCreatorIdFromToken = () => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      try {
        const payload = JSON.parse(atob(authToken.split('.')[1]));
        return payload.sub;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const id = getCreatorIdFromToken();
    if (id) {
      connectWebSocket(`${process.env.NEXT_PUBLIC_BACK_END_URL}/`, id);
    } else {
      router.push('/login');
    }

    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket]);

  return (
    <>ppppppp</>
  )
}

export default SocketConnectionProvider