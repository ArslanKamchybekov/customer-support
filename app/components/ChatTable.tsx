"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Tooltip,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material";
import { auth } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  getUserConversations,
  deleteConversation,
} from "../utils/firestore";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface ChatTableProps {
  onSelectConversation: (conversationId: string) => void;
  onCreateNewChat: () => void;
  onDeleteConversation: (conversationId: string) => void;
  selectedConversationId: string | null;
  newConversationTrigger: number;
  titleChangeTrigger: number;
}

const ChatTable: React.FC<ChatTableProps> = ({
  onSelectConversation,
  onCreateNewChat,
  onDeleteConversation,
  selectedConversationId,
  newConversationTrigger,
  titleChangeTrigger,
}) => {
  const [user] = useAuthState(auth);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const fetchConversations = useCallback(async () => {
    if (user) {
      try {
        const data = await getUserConversations(user.uid);
        setConversations(data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [user, newConversationTrigger, titleChangeTrigger, fetchConversations]);

  const truncateMessage = (message: string, maxLength: number = 30) => {
    return message.length > maxLength
      ? message.substring(0, maxLength) + "..."
      : message;
  };

  const handleDelete = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      await fetchConversations();
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#1F2937",
        color: "#E0E0E0",
        p: 4,
        borderRadius: 2,
        overflowX: "auto",
      }}
    >
      <Button
        onClick={onCreateNewChat}
        fullWidth
        variant="contained"
        sx={{
          mb: 2,
          py: 1.5,
          background: "linear-gradient(90deg, #42a5f5, #26c6da)",
          fontWeight: "bold",
          "&:hover": {
            background: "linear-gradient(90deg, #1e88e5, #00acc1)",
          },
        }}
      >
        Create New Chat
      </Button>
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: "#1F2937",
          maxHeight: 400,
          overflowY: "auto",
          borderRadius: 2,
        }}
      >
        <Table stickyHeader aria-label="conversations table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#26c6da", backgroundColor: "#1F2937" }}>
                Title
              </TableCell>
              <TableCell sx={{ color: "#26c6da", backgroundColor: "#1F2937" }}>
                Date
              </TableCell>
              <TableCell sx={{ color: "#26c6da", backgroundColor: "#1F2937" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {conversations.map((conversation) => (
              <TableRow
                key={conversation.id}
                sx={{
                  backgroundColor:
                    selectedConversationId === conversation.id
                      ? "#374151"
                      : "#1F2937",
                  "&:hover": {
                    backgroundColor: "#374151",
                  },
                }}
                onClick={() => onSelectConversation(conversation.id)}
                selected={selectedConversationId === conversation.id}
              >
                <TableCell sx={{ color: "#E0E0E0" }}>
                  {conversation.title}
                </TableCell>
                <TableCell sx={{ color: "#E0E0E0" }}>
                  {conversation.timestamp.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Tooltip title="Delete conversation" placement="top">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(conversation.id);
                      }}
                      sx={{ color: "#EF4444" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ChatTable;
