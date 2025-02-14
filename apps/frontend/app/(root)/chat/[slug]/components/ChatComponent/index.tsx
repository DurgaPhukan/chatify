"use client";

import Header from "@/app/components/Header";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

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

const ChatPage = () => {
  const params = useParams();
  const { slug } = params;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string>(slug as string);
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Ref for the messages container

  const getCreatorIdFromToken = () => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      try {
        const payload = JSON.parse(atob(authToken.split(".")[1])); // Decode JWT payload
        return payload.sub; // Assuming `creatorId` is in the token payload
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  };

  // Scroll to the bottom when new messages arrive
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Set creatorId from authToken on mount
  useEffect(() => {
    const id = getCreatorIdFromToken();
    if (id) {
      setCreatorId(id);
    } else {
      const router = useRouter();
      router.push("/login");
    }
  }, []);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io("http://localhost:4000", {
      query: {
        userId: creatorId
      },
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

    socket.emit("joinRoom", { roomId });

    socket.on("chatHistory", (chatHistory: Message[]) => {
      setMessages(chatHistory);
    });

    socket.on("newMessage", (newMessage: Message) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off("chatHistory");
      socket.off("newMessage");
    };
  }, [socket, roomId]);

  // Scroll to the bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (socket && message.trim() !== "" && creatorId) {
      const payload = {
        message,
        creatorId,
        roomId,
      };
      socket.emit("sendMessage", payload);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-grow overflow-y-auto bg-gray-100 p-4">
        <div className="mx-auto max-w-4xl">
          {messages.map((msg, index) => {
            const isMine = msg?.creatorId?._id === creatorId;
            return (
              <div
                key={msg.id || msg.message + index}
                className={`p-4 my-3 rounded-xl shadow-lg w-fit min-w-96 max-w-[70%] ${isMine
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-200 text-black mr-auto"
                  }`}
                style={{
                  alignSelf: isMine ? "flex-end" : "flex-start",
                }}
              >
                <div className="text-sm font-semibold">
                  {isMine ? "You" : msg.creatorId?.name}
                </div>
                <div className="mt-1 text-base">{msg.message}</div>
                <div
                  className={`text-xs mt-2 ${isMine ? "text-white" : "text-gray-500"
                    }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} /> {/* Reference to scroll */}
        </div>
      </div>

      <div className="py-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 flex justify-center">
        <div className="w-[70rem] flex items-center">
          <input
            type="text"
            className="flex-grow p-4 border border-gray-300 rounded-lg mr-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="p-4 bg-pink-600 text-white rounded-lg shadow-md hover:bg-pink-700 transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
