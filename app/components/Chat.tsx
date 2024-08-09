"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, TextField, Button, Typography } from "@mui/material";
import { createConversation, saveMessage, getMessages } from "../utils/firestore";
import { auth } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import SignIn from "./SignIn";
import ReactMarkdown from "react-markdown";
import FeedbackForm from "./FeedbackForm";

interface Message {
  text: string;
  sender: "user" | "ai";
}

interface ChatProps {
  conversationId: string;
  onTitleChange: () => void;
  isNewConversation: boolean;
  onNewConversationCreated: (newId: string) => void;
}

const Chat: React.FC<ChatProps> = ({
  conversationId,
  onTitleChange,
  isNewConversation,
  onNewConversationCreated,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user] = useAuthState(auth);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      getMessages(conversationId)
        .then(setMessages)
        .catch((error) => console.error("Error fetching messages:", error));
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFeedbackSubmit = (feedback: { rating: number; comment: string }) => {
    console.log("Feedback received:", feedback);
  };

  const handleSend = async () => {
    if (input.trim()) {
      setIsLoading(true);
      setMessages((prev) => [...prev, { text: input, sender: "user" }]);
      setInput("");

      try {
        let actualConversationId = conversationId;

        if (isNewConversation) {
          actualConversationId = await createConversation(user!.uid);
          onNewConversationCreated(actualConversationId);
        }

        await saveMessage(actualConversationId, { text: input, sender: "user" });

        const response = await fetch("/api/ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: input }),
        });
        console.log("Response:", response);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Response body is not readable");
        }

        const decoder = new TextDecoder();
        let result = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value, { stream: true });
          setMessages((prevMessages) => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            return [
              ...prevMessages.slice(0, -1),
              { ...lastMessage, text: result },
            ];
          });
        }

        await saveMessage(actualConversationId, { text: result, sender: "ai" });
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <Typography variant="h4" gutterBottom>
          Welcome to the Chat App
        </Typography>
        <Typography variant="body1" gutterBottom>
          Please sign in to start chatting.
        </Typography>
        <SignIn />
      </div>
    );
  }

  return (
    <Card sx={{ padding: 2, backgroundColor: "gray.800", color: "gray.100" }}>
      <CardContent>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Typography variant="h5" color="cyan.400">
            Welcome, {user.displayName}
          </Typography>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              onClick={() => setIsFeedbackModalOpen(true)}
              sx={{
                backgroundColor: "gray.700",
                color: "cyan.400",
                "&:hover": { backgroundColor: "gray.600" },
              }}
            >
              Feedback
            </Button>
            <Button
              onClick={() => auth.signOut()}
              sx={{
                backgroundColor: "gray.700",
                color: "cyan.400",
                "&:hover": { backgroundColor: "gray.600" },
              }}
            >
              Sign Out
            </Button>
          </div>
          <FeedbackForm
            isOpen={isFeedbackModalOpen}
            onClose={() => setIsFeedbackModalOpen(false)}
            onSubmit={handleFeedbackSubmit}
          />
        </div>
        <div style={{ height: 384, overflowY: "auto", marginBottom: 16 }}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: message.sender === "user" ? "flex-end" : "flex-start",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  maxWidth: 300,
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: message.sender === "user" ? "cyan.600" : "gray.700",
                  color: "white",
                  borderBottomRightRadius: message.sender === "user" ? 0 : 12,
                  borderBottomLeftRadius: message.sender === "ai" ? 0 : 12,
                }}
              >
                {message.sender === "user" ? (
                  message.text
                ) : (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {isLoading && <div style={{ textAlign: "center" }}>AI is typing...</div>}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ display: "flex" }}>
          <TextField
            fullWidth
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ marginRight: 2, input: { color: "gray.100" } }}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading}
            variant="contained"
            sx={{
              backgroundColor: "linear-gradient(to right, blue.400, blue.500, cyan.500)",
              color: "white",
              fontWeight: "bold",
              paddingY: 1,
              paddingX: 2,
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                backgroundColor: "linear-gradient(to right, blue.500, cyan.500, blue.600)",
              },
            }}
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chat;
