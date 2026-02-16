"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";

// The Look-and-Say sequence
const SEQUENCE = [
  "1",
  "11",
  "21",
  "1211",
  "111221",
];
const ANSWER = "312211";

const Level9 = ({ onComplete }) => {
  const [inputValue, setInputValue] = useState("");
  const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Correct!",
        description: "312211 — Three 1s, Two 2s, One 1. The Look-and-Say sequence!",
        variant: "success"
      });
      setTimeout(() => {
        onComplete(4);
      }, 2000);
    }
  }, [isSuccess, onComplete, toast]);

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

    const enterMatch = cmd.match(/^\/enter\s+(.+)$/i);
    const resetMatch = cmd.match(/^\/reset$/i);
    const helpMatch = cmd.match(/^\/help$/i);

    if (enterMatch) {
      const guess = enterMatch[1].trim().replace(/\s+/g, "");
      setAttempts((prev) => [...prev, guess]);

      if (guess === ANSWER) {
        setIsSuccess(true);
      } else {
        toast({
          title: "Incorrect ❌",
          description: `"${guess}" is not the next number. Look at the pattern more carefully.`,
          variant: "destructive"
      });
      }
    } else if (resetMatch) {
      setAttempts([]);
      setIsSuccess(false);
      toast({
        title: "Level Reset",
        description: "Try decoding the sequence again.",
        variant: "default"
      });
    } else if (helpMatch) {
      setHelpModalOpen(true);
    } else {
      toast({
        title: "Unknown Command",
        description: "Type /help to see available commands",
        variant: "destructive"
      });
    }

    setInputValue("");
  };

  const closeHelpModal = () => {
    setHelpModalOpen(false);
  };

  // Render a single digit with styling
  const renderDigit = (digit, x, color) => (
    <text
      x={x}
      y={0}
      fontSize="22"
      fill={color}
      fontWeight="bold"
      fontFamily="monospace"
      textAnchor="middle"
    >
      {digit}
    </text>
  );

  // Render a row of the sequence
  const renderRow = (str, rowIndex, isQuestion = false) => {
    const digits = str.split("");
    const totalWidth = digits.length * 22;
    const startX = 190 - totalWidth / 2 + 11;
    const y = 50 + rowIndex * 40;

    return (
      <motion.g
        key={rowIndex}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: rowIndex * 0.15 }}
      >
        {/* Row number label */}
        <text
          x="25"
          y={y}
          fontSize="11"
          fill="#555577"
          fontFamily="monospace"
          textAnchor="middle"
        >
          {rowIndex + 1}.
        </text>

        {/* Digits */}
        {isQuestion ? (
          <text
            x="190"
            y={y}
            fontSize="26"
            fill="#F9DC34"
            fontWeight="bold"
            fontFamily="monospace"
            textAnchor="middle"
          >
            ?
          </text>
        ) : (
          digits.map((digit, i) => (
            <text
              key={i}
              x={startX + i * 22}
              y={y}
              fontSize="20"
              fill={digit === "1" ? "#F9DC34" : digit === "2" ? "#A78BFA" : "#4ADE80"}
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {digit}
            </text>
          ))
        )}

        {/* Connecting line to next row */}
        {rowIndex < SEQUENCE.length && (
          <line
            x1="190"
            y1={y + 6}
            x2="190"
            y2={y + 26}
            stroke="#333355"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
        )}
      </motion.g>
    );
  };

  return (
    <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">
      {/* Level title badge - now in sticky header */}

      {/* Question */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8 text-lg font-semibold mb-4 text-center text-gray-900 dark:text-[#F9DC34]"
      >
        Enter the next number in the sequence.
      </motion.p>

      {/* Terminal-style display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-[#0a0a1a] dark:bg-[#0a0a1a] rounded-2xl shadow-lg border border-gray-700/30 w-full max-w-md relative overflow-hidden"
      >
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] border-b border-gray-700/20">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-3 text-xs text-gray-500 font-mono">sequence_decoder.exe</span>
        </div>

        <div className="p-4">
          <svg viewBox="0 0 380 325" className="w-full">
            {/* Scanline effect */}
            {[...Array(30)].map((_, i) => (
              <line
                key={`sl${i}`}
                x1={0}
                y1={i * 10}
                x2={380}
                y2={i * 10}
                stroke="#0f0f2f"
                strokeWidth="0.5"
                opacity="0.3"
              />
            ))}

            {/* Title */}
            <text
              x="190"
              y="25"
              textAnchor="middle"
              fontSize="12"
              fill="#4ADE80"
              fontFamily="monospace"
            >
              &gt; SEQUENCE ANALYSIS
            </text>

            {/* Sequence rows */}
            {SEQUENCE.map((row, i) => renderRow(row, i))}

            {/* Question mark row */}
            {renderRow("?", SEQUENCE.length, true)}

            {/* Blinking cursor */}
            <motion.rect
              x="202"
              y={50 + SEQUENCE.length * 40 - 18}
              width="12"
              height="2"
              fill="#F9DC34"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />


            {/* Bottom prompt */}
            <text
              x="190"
              y="305"
              textAnchor="middle"
              fontSize="10"
              fill="#555577"
              fontFamily="monospace"
            >
              Use /enter [number] to submit your answer
            </text>
          </svg>
        </div>
      </motion.div>

      {/* Attempts display */}
      {attempts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-md mt-3 flex flex-wrap gap-2 justify-center"
        >
          {attempts.slice(-5).map((attempt, i) => (
            <span
              key={i}
              className={`text-xs px-3 py-1 rounded-full border font-mono ${attempt === ANSWER
                  ? "bg-green-500/20 text-green-400 border-green-500/40"
                  : "bg-red-500/20 text-red-400 border-red-500/40 line-through"
                }`}
            >
              {attempt}
            </span>
          ))}
        </motion.div>
      )}

      {/* Help prompt */}
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
          onChange={handleInputChange}
          onKeyDown={(e) => { handleEnter(e); handleHistoryKeys(e); }}
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

      {/* Help Modal */}
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
              <div className="space-y-1 mb-6">
                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    /enter
                  </span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">[number]</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Enter the next number in the sequence.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    /reset
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Reset the level.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    /help
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Show commands and hints.
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-[#F9DC34]">
                The Sequence:
              </h3>
              <div className="space-y-1 mb-4 text-gray-600 dark:text-gray-300 font-mono text-center text-lg">
                {SEQUENCE.map((row, i) => (
                  <p key={i}>
                    {row.split("").join(" ")}
                  </p>
                ))}
                <p className="text-[#F9DC34] text-2xl">?</p>
              </div>

              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-[#F9DC34]">
                Hint:
              </h3>
              <p className="text-gray-600 dark:text-gray-300 italic">
                Read the previous number out loud.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/30 px-6 py-4 text-center flex-shrink-0">
              <button
                onClick={closeHelpModal}
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

export default Level9;