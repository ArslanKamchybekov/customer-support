"use client";
import React, { useState, ChangeEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Slider,
} from "@mui/material";
import { auth } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { saveFeedback } from "../utils/firestore";

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: { rating: number; comment: string }) => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [user] = useAuthState(auth);
  const [rating, setRating] = useState<number>(3);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (user) {
      try {
        await saveFeedback({
          userId: user.uid,
          name: user.displayName || "Anonymous",
          rating,
          comment,
          timestamp: new Date(),
        });
        onSubmit({ rating, comment });
        onClose();
      } catch (error) {
        console.error("Error saving feedback:", error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} PaperProps={{ style: { backgroundColor: "#2d3748", color: "#edf2f7" } }}>
      <DialogTitle>
        <Typography variant="h6" color="cyan.400">
          Provide Feedback
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <div className="mb-4">
          <Typography variant="body1" gutterBottom color="cyan.400">
            Rate your experience
          </Typography>
          <div className="flex items-center">
            <Slider
              value={rating}
              onChange={(event, value) => setRating(value as number)}
              aria-labelledby="rating-slider"
              step={1}
              marks
              min={0}
              max={5}
              sx={{ maxWidth: 300, color: "primary.main", marginRight: 2 }}
            />
            <Typography variant="body1" fontWeight="bold" color="cyan.400">
              {rating}
            </Typography>
          </div>
        </div>
        <TextField
          label="Additional comments"
          placeholder="Enter your feedback here"
          multiline
          fullWidth
          value={comment}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setComment(e.target.value)
          }
          variant="outlined"
          InputProps={{ style: { backgroundColor: "#4a5568", color: "#edf2f7" } }}
          InputLabelProps={{ style: { color: "#a0aec0" } }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ backgroundColor: "#4a5568", color: "#fc8181", "&:hover": { backgroundColor: "#2d3748" } }}>
          Close
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: "linear-gradient(to right, #4299e1, #3182ce, #2b6cb0)",
            color: "white",
            "&:hover": {
              backgroundColor: "linear-gradient(to right, #2b6cb0, #2c5282, #2a4365)",
            },
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackForm;
