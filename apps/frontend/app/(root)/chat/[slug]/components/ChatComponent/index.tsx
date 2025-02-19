"use client";
import { useChat } from "@/app/components/Context/ContextProvider";
import Header from "@/app/components/Header";
// import { useChat } from "@/app/Context/ContextProvider";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const { state, joinRoom, sendMessage: sendMessageToSocket } = useChat();
  const [message, setMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Scroll to the bottom when new messages arrive
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Join room when component mounts
  useEffect(() => {
    if (slug) {
      joinRoom(slug as string);
    }
  }, [slug]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const sendMessage = () => {
    if (message.trim() !== "") {
      sendMessageToSocket(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[56.2rem]">
      <div className="flex-grow overflow-y-auto bg-gray-100">
        <div className="mx-auto max-w-4xl">
          {state.messages.map((msg, index) => {
            const isMine = msg?.creatorId?._id === state.creatorId;
            return (
              <div
                key={msg.id || msg.message + index}
                className={`p-4 mx-3 my-3 rounded-xl shadow-lg w-fit min-w-64 md:min-w-96 max-w-[80%] ${isMine
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

      <div className="px-3 py-3 bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 flex justify-center">
        <div className="w-[30rem] md:w-[70rem] flex items-center">
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
            className="p-2 md:py-4 md:px-8 bg-pink-600 text-white rounded-lg shadow-md hover:bg-pink-700 transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;