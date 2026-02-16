
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";

const generateRandomBits = () => {
  return Array.from({ length: 7 }, () => (Math.random() > 0.5 ? 1 : 0));
};

const Level6 = ({ onComplete }) => {
  const [bits, setBits] = useState(() => generateRandomBits());
  const [inputValue, setInputValue] = useState("");
  const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const correctNumber = useMemo(() => {
    return parseInt(bits.join(""), 2);
  }, [bits]);


  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Access Granted",
        description: `Correct Number: ${correctNumber}`,
        variant: "success"
      });

      setTimeout(() => {
        onComplete(4);
      }, 2000);
    }
  }, [isSuccess, correctNumber, onComplete, toast]);

  const handleCommandSubmit = () => {
    pushCommand(inputValue);
    const cmd = inputValue.trim().toLowerCase();

    const numberMatch = cmd.match(/^\/number\s+(\d+)$/i);
    const resetMatch = cmd.match(/^\/reset$/i);
    const helpMatch = cmd.match(/^\/help$/i);

    if (numberMatch) {
      const guess = parseInt(numberMatch[1]);

      if (guess === correctNumber) {
        setIsSuccess(true);
      } else {
        setAttempts((prev) => [...prev, guess]);
        toast({
          title: "Incorrect ❌",
          description: `"${guess}" is not correct.`,
          variant: "destructive"
      });
      }
    } else if (resetMatch) {
      setBits(generateRandomBits());
      setAttempts([]);
      setIsSuccess(false);
      toast({
        title: "Circuit Reset",
        description: "New random circuit generated.",
      });
    } else if (helpMatch) {
      setHelpModalOpen(true);
    } else {
      toast({
        title: "Unknown Command",
        description: "Type /help to see available commands",
        variant: "destructive",
      });
    }

    setInputValue("");
  };

  const renderBulb = (isOn, index) => {
    const cx = 35 + index * 48;
    const cy = 80;

    return (
      <motion.g
        key={index}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        {isOn === 1 && (
          <circle
            cx={cx}
            cy={cy}
            r="16"
            fill="#F9DC34"
            opacity="0.35"
            style={{ filter: "blur(10px)" }}
          />
        )}

        <path
          d={`M${cx - 10},${cy} a10,10 0 1,1 20,0 c0,5 -3,7 -3,11 h-14 c0,-4 -3,-6 -3,-11`}
          fill={isOn === 1 ? "#F9DC34" : "#1A1A1A"}
          stroke={isOn === 1 ? "#F5A623" : "#4A4A5A"}
          strokeWidth="2"
        />

        <rect x={cx - 6} y={cy + 11} width="12" height="5" fill="#666" rx="1" />
      </motion.g>
    );
  };

  return (
    <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">
      {/* Level title badge - now in sticky header */}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 text-xl font-semibold mb-4 text-center text-gray-900 dark:text-[#F9DC34]"
      >
        Decode the circuit and compute the final number.
      </motion.p>

      {/* Circuit Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0a0a1a] rounded-2xl p-4 shadow-lg border border-gray-700/30 w-full max-w-md"
      >
        <svg viewBox="0 0 370 160" className="w-full">
          {bits.map((bit, index) => renderBulb(bit, index))}
        </svg>
      </motion.div>

      {/* Attempts */}
      {attempts.length > 0 && (
        <div className="w-full max-w-md mt-3 flex flex-wrap gap-2 justify-center">
          {attempts.slice(-5).map((attempt, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1 rounded-full border bg-red-500/20 text-red-400 border-red-500/40 line-through"
            >
              {attempt}
            </span>
          ))}
        </div>
      )}

      {/* Sticky Command Panel */}
      <div className="sticky bottom-0 left-0 right-0 z-40 border-t border-gray-500/20 py-4 mt-8">
        <div className="flex flex-col items-center gap-3 max-w-4xl mx-auto px-4">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm text-center cursor-pointer text-gray-700 dark:text-gray-300 hover:text-[#F5A623] dark:hover:text-[#F9DC34] transition-colors"
            onClick={() => setHelpModalOpen(true)}
          >
            Type{" "}
            <span className="font-mono bg-gray-100 dark:bg-gray-900/30 px-2 py-1 rounded">
              /help
            </span>{" "}
            to get commands and hints
          </motion.span>

          {/* Command input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex gap-2 w-full max-w-md"
          >
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCommandSubmit(); handleHistoryKeys(e); }}
              placeholder="Enter command..."
              className="border-gray-300 dark:border-gray-600/50 bg-white dark:bg-[#111111]/70 shadow-inner focus:ring-[#F5A623] focus:border-[#F9DC34]"
            />
            <button
              onClick={handleCommandSubmit}
              className="bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] p-2 rounded-lg shadow-md transition-transform hover:scale-105"
            >
              <Image
                src="/runcode.png"
                alt="Run"
                height={20}
                width={20}
                className="rounded-sm"
              />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Help Modal (Aligned Design) */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden shadow-2xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
          >
            <div className="p-6 overflow-y-auto flex-grow">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-[#F9DC34]">
                Available Commands:
              </h2>

              <div className="space-y-3 mb-6">
                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    /number
                  </span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">[value]</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Submit the final calculated number.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    /reset
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Generate a new random circuit.
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-[#F9DC34]">
                Rules:
              </h3>

              <div className="space-y-2 mb-4 text-gray-600 dark:text-gray-300 text-sm">
                <p>• Analyze the circuit carefully</p>
                <p>• Convert the sequence into its numeric form</p>
                <p>• Submit the final number</p>

              </div>

              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-[#F9DC34]">
                Hint:
              </h3>

              <p className="text-gray-600 dark:text-gray-300 italic">
              Compute its integer representation
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/30 px-6 py-4 text-center flex-shrink-0">
              <button
                onClick={() => setHelpModalOpen(false)}
                className="bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] px-6 py-2 rounded-lg text-gray-900 font-medium shadow-md transition-transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Level6;
