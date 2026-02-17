"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { useTheme } from "next-themes";
import { ArrowRight, Zap, Target, RotateCcw } from "lucide-react";

const Level14 = ({ onComplete }) => {
  const [value, setValue] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (value === 10 && !isSuccess) {
      setIsSuccess(true);
      toast({
        title: "System Calibrated! 🎯",
        description: "Target value 10 reached. Stability restored.",
        variant: "success",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
      });
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  }, [value, isSuccess, onComplete, toast]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleCommandSubmit();
    }
  };

  const handleCommandSubmit = () => {
    pushCommand(inputValue);
    const cmd = inputValue.trim().toLowerCase();

    const doubleMatch = cmd.match(/^\/double$/i);
    const addMatch = cmd.match(/^\/add$/i);
    const resetMatch = cmd.match(/^\/reset$/i);
    const helpMatch = cmd.match(/^\/help$/i);

    if (doubleMatch) {
      setValue(prev => prev * 2);
      toast({
        title: "Power Doubled ⚡",
        description: "The core energy has been amplified.",
        variant: "default",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
      });
    } else if (addMatch) {
      setValue(prev => prev + 1);
      toast({
        title: "Increment Applied ➕",
        description: "Small adjustment made to the core.",
        variant: "default",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
      });
    } else if (resetMatch) {
      setValue(1);
      toast({
        title: "System Reset 🔄",
        description: "Core returned to default state.",
        variant: "default",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
      });
    } else if (helpMatch) {
      setHelpModalOpen(true);
    } else {
      toast({
        title: "Signal Lost ❌",
        description: "Unknown command. Access /help for protocols.",
        variant: "destructive",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
      });
    }

    setInputValue("");
  };

  return (
    <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-6 py-3 text-2xl font-bold text-[#1A1A1A] dark:text-[#111111] bg-gradient-to-r from-[#F9DC34] to-[#F5A623] rounded-full shadow-lg"
      >
        Level 14
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8 text-xl font-semibold mb-4 text-center text-gray-900 dark:text-[#F9DC34]"
      >
        Core Calibration — Reach the target alignment.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white dark:bg-[#1A1A1A]/40 rounded-2xl p-6 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700/30 w-full max-w-md flex flex-col items-center"
      >
        <div className="text-gray-400 font-mono text-xs mb-4 tracking-widest uppercase opacity-70">Calibration Status</div>

        <motion.div
          key={value}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl font-black bg-clip-text text-transparent bg-gradient-to-br from-[#F9DC34] to-[#F5A623] mb-8"
        >
          {value}
        </motion.div>

        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-8 relative overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#F9DC34] to-[#F5A623]"
            initial={{ width: "10%" }}
            animate={{ width: `${Math.min((value / 10) * 100, 100)}%` }}
            transition={{ type: "spring", stiffness: 100 }}
          />
        </div>

        <div className="flex justify-between w-full px-2">
          <div className="text-center">
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter mb-1">Status</div>
            <div className={`text-xs font-bold ${value === 10 ? "text-green-500" : value > 10 ? "text-red-500" : "text-yellow-500"}`}>
              {value === 10 ? "OPTIMIZED" : value > 10 ? "OVERLOADED" : "UNSTABLE"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter mb-1">Target</div>
            <div className="text-xs font-bold text-gray-700 dark:text-gray-300">10.00</div>
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
          onKeyDown={(e) => { handleEnter(e); handleHistoryKeys(e); }}
          placeholder="Enter command..."
          className="border-gray-300 dark:border-gray-600/50 bg-white dark:bg-[#111111]/70 shadow-inner focus:ring-[#F5A623] focus:border-[#F9DC34]"
        />
        <button
          onClick={handleCommandSubmit}
          className="bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] p-2 rounded-lg shadow-md transition-transform hover:scale-105 flex items-center justify-center w-12"
        >
          <ArrowRight className="w-5 h-5 text-gray-900" />
        </button>
      </motion.div>

      <AnimatePresence>
        {isHelpModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden shadow-2xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
            >
              <div className="p-6 overflow-y-auto flex-grow">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-[#F9DC34]">Available Commands:</h2>
                <div className="space-y-1 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-gray-700 dark:text-gray-300">/double</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Amplify the core resonance (x2).</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-gray-700 dark:text-gray-300">/add</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Small calibration nudge (+1).</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-gray-700 dark:text-gray-300">/reset</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Restore factory alignment (Returns to 1).</p>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-[#F9DC34]">Hint:</h3>
                <p className="text-gray-600 dark:text-gray-300 italic">"Expand the core until the third echo reaches the brink; then, mend the fractured whole twice over"</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/30 px-6 py-4 text-center">
                <button onClick={() => setHelpModalOpen(false)} className="bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] px-6 py-2 rounded-lg text-gray-900 font-medium shadow-md transition-transform hover:scale-105">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Level14;