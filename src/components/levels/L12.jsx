import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ArrowRight, Clock } from "lucide-react";
import { useToast } from "../ui/use-toast";

const TimekeepersLevel = ({ levelNumber, onComplete, nextLevelNumber }) => {
  const [inputValue, setInputValue] = useState("");
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("8:46");
  const [isSuccess, setIsSuccess] = useState(false);

  const { toast } = useToast();

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (currentTime === "10:58") {
      setIsSuccess(true);
      toast({
        title: "Level Completed!",
        description: "You've reset the ancient clock to 10:58!",
        variant: "success",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
      });
      
      setTimeout(() => {
        onComplete(nextLevelNumber);
      }, 2000);
    }
  }, [currentTime, nextLevelNumber, onComplete, toast]);

  const resetGame = () => {
    setCurrentTime("8:46");
    setIsSuccess(false);
    toast({
      title: "Level Reset",
      description: "The clock has been reset to 8:46",
      variant: "default",
      className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
    });
  };

  const allowedMoves = [
    "+3m", "+9m", "+15m", "+27m", "+1h3m", "+1h30m", 
    "-6m", "-12m"
  ];

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCommandSubmit();
    }
  };

  const handleCommandSubmit = () => {
    const resetMatch = inputValue.match(/^\/reset$/i);
    const helpMatch = inputValue.match(/^\/help$/i);
    const moveMatch = inputValue.match(/^\/move\s+([+-]\d+h?\d*m?)$/i);
    
    if (resetMatch) {
      resetGame();
    } else if (helpMatch) {
      setHelpModalOpen(true);
    } else if (moveMatch) {
      const move = moveMatch[1];
      
      if (!allowedMoves.includes(move)) {
        toast({
          title: "Invalid Move",
          description: "This move is not allowed. Check /help for valid moves.",
          variant: "destructive",
          className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
        });
        setInputValue("");
        return;
      }

      const minutes = parseMoveToMinutes(move);
      
      const currentMinutes = timeToMinutes(currentTime);
      const newMinutes = currentMinutes + minutes;
      
      const finalMinutes = Math.max(0, newMinutes);
      
      setCurrentTime(minutesToTime(finalMinutes));
      
      toast({
        title: "Time Moved",
        description: `Moved by ${move}. Current time: ${minutesToTime(finalMinutes)}`,
        variant: "default",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
      });
    } else {
      toast({
        title: "Unknown Command",
        description: "Type /help to see available commands",
        variant: "destructive",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
      });
    }
    
    setInputValue("");
  };

  const parseMoveToMinutes = (move) => {
    const hourMatch = move.match(/(\d+)h/);
    const minuteMatch = move.match(/(\d+)m/);
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
    const sign = move.startsWith('-') ? -1 : 1;
    
    return sign * (hours * 60 + minutes);
  };

  return (
    <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-6 py-3 text-2xl font-bold text-[#1A1A1A] dark:text-[#111111] bg-gradient-to-r from-[#F9DC34] to-[#F5A623] rounded-full shadow-lg"
      >
        Level 12
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8 text-xl font-semibold mb-4 text-center text-gray-900 dark:text-[#F9DC34]"
      >
        The ancient clock is stuck at 8:46. Reset it to 10:58!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white dark:bg-[#1A1A1A]/40 rounded-2xl p-6 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700/30 w-full max-w-md"
      >
        <div className="min-h-48 flex flex-col items-center justify-center">
          <Clock className="w-24 h-24 text-gray-700 dark:text-gray-300 mb-4" />
          <div className="text-4xl font-bold text-gray-800 dark:text-[#F9DC34]">
            {currentTime}
          </div>
        </div>
      </motion.div>
      
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mx-10 my-6 text-center cursor-pointer text-gray-700 dark:text-gray-300 hover:text-[#F5A623] dark:hover:text-[#F9DC34] transition-colors"
        onClick={() => setHelpModalOpen(true)}
      >
        Type <span className="font-mono bg-gray-100 dark:bg-gray-900/30 px-2 py-1 rounded">/help</span> to get commands and hints
      </motion.span>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex gap-2 w-full max-w-md"
      >
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter command (e.g., /move +1h3m)"
          className="border-gray-300 dark:border-gray-600/50 bg-white dark:bg-[#111111]/70 shadow-inner focus:ring-[#F5A623] focus:border-[#F9DC34]"
        />
        <button 
          onClick={handleCommandSubmit}
          className="bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] p-2 rounded-lg shadow-md transition-transform hover:scale-105"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-gray-900" />
          </div>
        </button>
      </motion.div>

      <AnimatePresence>
        {isHelpModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden shadow-2xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
            >
              <div className="p-6 overflow-y-auto flex-grow">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-[#F9DC34]">Allowed Moves:</h2>
                <div className="space-y-1 mb-6">
                  {allowedMoves.map((move) => (
                    <div key={move} className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                      <span className="font-bold text-gray-700 dark:text-gray-300">/move {move}</span>
                    </div>
                  ))}
                  
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-gray-700 dark:text-gray-300">/reset</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Reset the clock to 8:46.</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-[#F9DC34]">How to Play:</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                  <li>You must reset the clock from 8:46 to 10:58</li>
                  <li>Use only the allowed time moves</li>
                </ul>
                
               
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900/30 px-6 py-4 text-center">
                <button
                  onClick={() => setHelpModalOpen(false)}
                  className="bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] px-6 py-2 rounded-lg text-gray-900 font-medium shadow-md transition-transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimekeepersLevel;