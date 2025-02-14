"use client"
import React from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/app/utils/getAuthToken";
import { useRouter } from 'next/navigation'

type ChatRoom = {
  _id: string;
  title: string;
  description: string;
  creatorId: string;
  startTime: string;
  endTime: string;
};

const fetchChatRooms = async (): Promise<ChatRoom[]> => {
  const token = getAuthToken()
  if (!token) {
    throw new Error("Authorization token is missing");
  }
  const response = await axios.get(`${process.env.NEXT_PUBLIC_BACK_END_URL}/broadcasts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const BroadcastList: React.FC = () => {
  const router = useRouter()

  const {
    data: chatRooms,
    isLoading,
    error,
  } = useQuery<ChatRoom[]>({
    queryKey: ["chatRooms"],
    queryFn: fetchChatRooms,
  });

  if (isLoading) {
    return <div className="text-center mt-10">
      <h3 className="text-xl font-semibold text-pink-500">
        Loading chat rooms...
      </h3>
    </div>;
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
        {chatRooms.map((room, index) => (
          <Card
            key={room._id + index}
            className="shadow-lg hover:shadow-xl transition-shadow duration-300 py-4"
          >
            <CardContent>
              <h2 className="text-xl font-bold mb-2">{room.title}</h2>
              <p className="text-gray-600 mb-4">{room.description}</p>
              <Button onClick={() => router.push(`/chat/${room._id}`)} className="w-full">Join Chat</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div >
  );
};

export default BroadcastList;
