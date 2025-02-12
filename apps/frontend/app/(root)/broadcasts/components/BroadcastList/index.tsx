"use client"
import React from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/app/utils/getAuthToken";

type ChatRoom = {
  id: string;
  title: string;
  description: string;
};

const fetchChatRooms = async (): Promise<ChatRoom[]> => {
  const token = getAuthToken()
  // if (!token) {
  //   throw new Error("Authorization token is missing");
  // }
  const response = await axios.get("http://localhost:4000/broadcasts", {
    headers: {
      // Authorization: `Bearer ${token}`, // Add auth token in the request
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhbmpveW9mZmljYWxwQGdtYWlsLmNvbSIsInN1YiI6IjY3YWNiNjA4YWIxMjBjYWU3NWI2MGVkNiIsImlhdCI6MTczOTM4NDIyNSwiZXhwIjoxNzM5Mzg3ODI1fQ.P3jw3QkK61SjWSVfsu1xPHUVypHH1jMUZl0Vu6gwvXQ"
    },
  });

  return response.data;
};

const BroadcastList: React.FC = () => {
  const {
    data: chatRooms,
    isLoading,
    error,
  } = useQuery<ChatRoom[]>({
    queryKey: ["chatRooms"], // Query key must be an array
    queryFn: fetchChatRooms,
  });

  if (isLoading) {
    return <div className="text-center mt-10">Loading chat rooms...</div>;
  }

  if (error instanceof Error) {
    return (
      <div className="text-center mt-10 text-red-500">
        Failed to load chat rooms: {error.message}
      </div>
    );
  }

  if (!chatRooms || chatRooms.length === 0) {
    return <div className="text-center mt-10">No chat rooms available</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-semibold text-center mb-6">Available Chat Rooms</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {chatRooms.map((room) => (
          <Card
            key={room.id}
            className="shadow-lg hover:shadow-xl transition-shadow duration-300 py-4"
          >
            <CardContent>
              <h2 className="text-xl font-bold mb-2">{room.title}</h2>
              <p className="text-gray-600 mb-4">{room.description}</p>
              <Button className="w-full">Join Chat</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BroadcastList;
