"use client";
import { useChat } from '@/app/components/Context/ContextProvider';
import { useRouter } from 'next/navigation';
import React, { ReactNode, useEffect, useCallback } from 'react';

const SocketConnectionWrapper = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { connectWebSocket } = useChat();

  const initializeSocket = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isTokenExpired = payload.exp * 1000 < Date.now();

      if (isTokenExpired) {
        localStorage.removeItem("authToken");
        router.push("/login");
        return;
      }

      const socketUrl = process.env.NEXT_PUBLIC_BACK_END_URL || 'http://localhost:4000';
      connectWebSocket(socketUrl, payload.sub);
    } catch (error) {
      console.error('Error initializing socket:', error);
      router.push("/login");
    }
  }, [connectWebSocket, router]);

  useEffect(() => {
    initializeSocket();
  }, [initializeSocket]);

  return <>{children}</>;
};

export default SocketConnectionWrapper;