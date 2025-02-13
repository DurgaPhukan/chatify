"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  message: string;
  creatorId: string;
  createdAt: string;
}

const ChatPage = () => {

  const params = useParams();
  const { slug } = params;
  console.log("this is slug", slug)

  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const [creatorId, setCreatorId] = useState<string>("67ad99b7d94c1312eeb0c34f"); // Example creatorId
  const [roomId, setRoomId] = useState<string>(slug as string || "67ad99b7d94c1312eeb0c350"); // Example roomId

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io("http://localhost:4000", {
      withCredentials: true,
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join room and load chat history
  useEffect(() => {
    if (!socket || !roomId) return;

    // Join the room
    socket.emit("joinRoom", { roomId });

    // Listen for chat history
    socket.on("chatHistory", (chatHistory: Message[]) => {
      setMessages(chatHistory); // Load initial messages
    });

    // Listen for new messages
    socket.on("newMessage", (newMessage: Message) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]); // Append new messages
    });

    return () => {
      socket.off("chatHistory");
      socket.off("newMessage");
    };
  }, [socket, roomId]);

  // Send a message
  const sendMessage = () => {
    if (socket && message.trim() !== "") {
      const payload = {
        message,
        creatorId,
        roomId,
      };
      socket.emit("sendMessage", payload);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Chat messages */}
      <div className="flex-grow overflow-y-auto bg-gray-100 p-4">
        {messages.map((msg, index) => (
          <div key={msg.id || msg.message + index} className="p-2 my-2 bg-white shadow rounded">
            <strong>{msg.creatorId}:</strong> {msg.message}
            <div className="text-xs text-gray-500">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {/* Message input */}
      <div className="flex p-4 bg-gray-200">
        <input
          type="text"
          className="flex-grow p-2 border rounded mr-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
