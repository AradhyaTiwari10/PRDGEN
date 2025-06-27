import { useState, useEffect } from 'react';

interface UseTypingAnimationOptions {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  prefix?: string;
}

export function useTypingAnimation({
  texts,
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseDuration = 2500,
  prefix = '',
}: UseTypingAnimationOptions) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (texts.length === 0) return;

    // Start animation after a small delay
    if (!hasStarted) {
      const startTimer = setTimeout(() => {
        setHasStarted(true);
      }, 1000);
      return () => clearTimeout(startTimer);
    }

    const targetText = texts[currentTextIndex];
    
    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      
      return () => clearTimeout(pauseTimer);
    }

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < targetText.length) {
          setCurrentText(targetText.slice(0, currentText.length + 1));
        } else {
          // Finished typing, start pause
          setIsPaused(true);
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          // Finished deleting, move to next text
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, currentTextIndex, isDeleting, isPaused, hasStarted, texts, typingSpeed, deletingSpeed, pauseDuration]);

  return prefix + currentText;
} 