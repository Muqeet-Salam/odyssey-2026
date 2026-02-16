import { useState, useCallback } from "react";

/**
 * Custom hook for managing command history with arrow key navigation
 * @param {Function} setInputValue - Setter function for the input value
 * @returns {Object} - Object containing pushCommand and handleKeyDown functions
 */
export const useCommandHistory = (setInputValue) => {
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pushCommand = useCallback((command) => {
    if (command.trim()) {
      setHistory((prev) => [...prev, command]);
      setHistoryIndex(-1);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (history.length === 0) return;

        const newIndex =
          historyIndex === -1
            ? history.length - 1
            : Math.max(0, historyIndex - 1);

        setHistoryIndex(newIndex);
        setInputValue(history[newIndex]);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex === -1) return;

        const newIndex = historyIndex + 1;

        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInputValue("");
        } else {
          setHistoryIndex(newIndex);
          setInputValue(history[newIndex]);
        }
      }
    },
    [history, historyIndex, setInputValue]
  );

  return { pushCommand, handleKeyDown };
};
