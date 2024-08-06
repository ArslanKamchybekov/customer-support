'use client';

import { Stack, Box, TextField, Button } from "@mui/material";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome to Navability Customer Support! How can I help you today?" },
  ]);

  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  const parseBoldText = (text) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    return text.replace(boldRegex, "<strong>$1</strong>");
  };

  const sendMessage = async () => {
    setMessage('')  // Clear the input field
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },  // Add the user's message to the chat
      { role: 'assistant', content: '' },  // Add a placeholder for the assistant's response
    ])
  
    // Send the message to the server
    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader()  // Get a reader to read the response body
      const decoder = new TextDecoder()  // Create a decoder to decode the response text
  
      let result = ''
      // Function to process the text from the response
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true })  // Decode the text
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]  // Get the last message (assistant's placeholder)
          let otherMessages = messages.slice(0, messages.length - 1)  // Get all other messages
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },  // Append the decoded text to the assistant's message
          ]
        })
        return reader.read().then(processText)  // Continue reading the next chunk of the response
      })
    })
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      width="100vw"
      padding={2}
    >
      <Stack
        spacing={2}
        direction="column"
        justifyContent="center"
        alignItems="center"
        width="500px"
        height="700px"
        border={1}
      >
        <Box
          flexGrow={1}
          width="100%"
          overflow="auto"
          display="flex"
          flexDirection="column"
          padding={2}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === "assistant" ? "flex-start" : "flex-end"}
              width="100%"
              padding={2}
            >
              <Box
                bgcolor={message.role === "assistant" ? "primary.main" : "secondary.main"}
                color="white"
                borderRadius={2}
                padding={2}
                maxWidth="75%"
              >
                <div dangerouslySetInnerHTML={{ __html: parseBoldText(message.content) }} />
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>
        <Stack spacing={2} direction="row" width="100%" padding={1}>
          <TextField
            label="Type a message"
            variant="outlined"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
          />
          <Button variant="contained" color="primary" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
