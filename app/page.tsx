"use client";
import React, { useState, useCallback } from "react";
import { CircularProgress, Button, Box, Typography } from "@mui/material";
import { auth } from "./utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Chat from "./components/Chat";
import ChatTable from "./components/ChatTable";
import SignIn from "./components/SignIn";
import { deleteConversation } from "./utils/firestore";

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const [selectedConversation, setSelectedConversation] = useState<string>(
    "temp-" + Date.now()
  );
  const [newConversationTrigger, setNewConversationTrigger] = useState(0);
  const [titleChangeTrigger, setTitleChangeTrigger] = useState(0);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const handleTitleChange = useCallback(() => {
    setTitleChangeTrigger((prev) => prev + 1);
  }, []);

  const handleCreateNewChat = () => {
    const tempId = "temp-" + Date.now();
    setSelectedConversation(tempId);
    setNewConversationTrigger((prev) => prev + 1);
  };

  const handleDelete = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      if (selectedConversation === conversationId) {
        const tempId = "temp-" + Date.now();
        setSelectedConversation(tempId);
      }
      setNewConversationTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex flex-col items-center justify-center h-screen">
        <Typography variant="h6" color="error">
          Error: {error.message}
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box className="flex flex-col items-center justify-center h-screen">
        <SignIn />
      </Box>
    );
  }

  return (
    <Box className="flex min-h-screen flex-col items-center p-24 relative">
      <Box className="absolute inset-0 z-0 bg-[#161517]">
        <svg
          className="w-full h-full svg-color"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          <image
            href="/images/topography.svg"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
          />
        </svg>
      </Box>
      <Box className="relative z-10 w-full max-w-6xl">
        <Typography variant="h3" className="text-3xl font-bold mb-8" align="center">
          Customer Support Chat
        </Typography>
        <Box className="flex gap-8">
          <Box className="w-1/3 min-w-[300px]">
            <ChatTable
              onSelectConversation={handleSelectConversation}
              onCreateNewChat={handleCreateNewChat}
              onDeleteConversation={handleDelete}
              selectedConversationId={selectedConversation}
              newConversationTrigger={newConversationTrigger}
              titleChangeTrigger={titleChangeTrigger}
            />
          </Box>
          <Box className="w-2/3">
            <Chat
              conversationId={selectedConversation}
              onTitleChange={handleTitleChange}
              isNewConversation={
                selectedConversation?.startsWith("temp-") ?? false
              }
              onNewConversationCreated={(newId) =>
                setSelectedConversation(newId)
              }
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
