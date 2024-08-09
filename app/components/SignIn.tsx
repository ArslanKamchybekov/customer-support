'use client'
import React, { useRef, useEffect } from 'react';
import { Button, Container, Typography, Box } from "@mui/material";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '../utils/firebase';

const SignIn = () => {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
          // Handle successful sign-in
          console.log("User signed in:", result.user);
        }).catch((error) => {
      // Handle errors
      console.error("Error during sign-in:", error);
    });
  };

  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (backgroundRef.current) {
        const { clientX, clientY } = event;
        const { width, height } = backgroundRef.current.getBoundingClientRect();
        const centerX = width / 2;
        const centerY = height / 2;
        const distanceX = clientX - centerX;
        const distanceY = clientY - centerY;
        const angle = Math.atan2(distanceY, distanceX);
        const radius = Math.sqrt(distanceX ** 2 + distanceY ** 2);
        const gradientAngle = (angle + Math.PI) * 180 / Math.PI;

        backgroundRef.current.style.background = `radial-gradient(circle at ${clientX}px ${clientY}px, #0e1016, #040506)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <Box 
      ref={backgroundRef}
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(circle at center, #0e1016, #040506)',
      }}
    >
      <Container maxWidth="xs" sx={{ textAlign: 'center', color: '#fff' }}>
        <Typography 
          variant="h1" 
          component="h1" 
          sx={{
            background: 'linear-gradient(90deg, #42a5f5, #26c6da)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 3,
          }}
        >
          Welcome
        </Typography>
        <Typography variant="h5" component="p" sx={{ marginBottom: 4 }}>
          Please sign in to start chatting.
        </Typography>
        <Button
          onClick={signInWithGoogle}
          variant="contained"
          size="large"
          sx={{
            background: 'linear-gradient(90deg, #42a5f5, #26c6da)',
            color: '#fff',
            padding: '10px 20px',
            fontSize: '1.25rem',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          Sign in with Google
        </Button>
      </Container>
    </Box>
  );
};

export default SignIn;
