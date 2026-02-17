"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

const JUG_5_MAX = 5;
const JUG_3_MAX = 3;
const TARGET = 4;

const Level15 = ({ onComplete }) => {
  const [inputValue, setInputValue] = useState("");
  const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [jug5, setJug5] = useState(0);
  const [jug3, setJug3] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Auto-detect win: either jug reaches exactly TARGET liters
  useEffect(() => {
    if (jug5 === TARGET && !isSuccess) {
      setIsSuccess(true);
    }
  }, [jug5, isSuccess]);

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Level Complete!",
        description: `Exactly 4 liters in the 5L jug in ${moveCount} moves!`,
        variant: "success"
      });
      setTimeout(() => {
        onComplete(4);
      }, 2000);
    }
  }, [isSuccess, onComplete, toast, moveCount]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleCommandSubmit();
    }
  };

  const parseJug = (s) => {
    const cleaned = s.trim().toLowerCase();
    if (cleaned === "5l" || cleaned === "5") return 5;
    if (cleaned === "3l" || cleaned === "3") return 3;
    return null;
  };

  const handleCommandSubmit = () => {
    pushCommand(inputValue);
    const cmd = inputValue.trim().toLowerCase();

    const themeMatch = cmd.match(/^\/theme\s+(dark|light)$/i);
    const fillMatch = cmd.match(/^\/fill\s+(.+)$/i);
    const emptyMatch = cmd.match(/^\/empty\s+(.+)$/i);
    const pourMatch = cmd.match(/^\/pour\s+(\S+)\s+(\S+)$/i);
    const resetMatch = cmd.match(/^\/reset$/i);
    const helpMatch = cmd.match(/^\/help$/i);

    if (fillMatch) {
      const jug = parseJug(fillMatch[1]);
      if (jug === 5) {
        setJug5(JUG_5_MAX);
        setMoveCount((p) => p + 1);
        toast({
          title: "Filled 5L Jug",
          description: "The 5-liter jug is now full.",
          variant: "default"
        });
      } else if (jug === 3) {
        setJug3(JUG_3_MAX);
        setMoveCount((p) => p + 1);
        toast({
          title: "Filled 3L Jug",
          description: "The 3-liter jug is now full.",
          variant: "default"
        });
      } else {
        toast({
          title: "Invalid Jug",
          description: "Specify 5L or 3L.",
          variant: "destructive"
        });
      }
    } else if (emptyMatch) {
      const jug = parseJug(emptyMatch[1]);
      if (jug === 5) {
        setJug5(0);
        setMoveCount((p) => p + 1);
        toast({
          title: "Emptied 5L Jug",
          description: "The 5-liter jug is now empty.",
          variant: "default"
        });
      } else if (jug === 3) {
        setJug3(0);
        setMoveCount((p) => p + 1);
        toast({
          title: "Emptied 3L Jug",
          description: "The 3-liter jug is now empty.",
          variant: "default"
        });
      } else {
        toast({
          title: "Invalid Jug",
          description: "Specify 5L or 3L.",
          variant: "destructive"
        });
      }
    } else if (pourMatch) {
      const from = parseJug(pourMatch[1]);
      const to = parseJug(pourMatch[2]);

      if (!from || !to || from === to) {
        toast({
          title: "Invalid Pour",
          description: "Use /pour 5L 3L or /pour 3L 5L",
          variant: "destructive"
        });
      } else if (from === 5 && to === 3) {
        const space = JUG_3_MAX - jug3;
        const poured = Math.min(jug5, space);
        setJug5((p) => p - poured);
        setJug3((p) => p + poured);
        setMoveCount((p) => p + 1);
        toast({
          title: `Poured ${poured}L → 3L Jug`,
          description: `5L: ${jug5 - poured}L | 3L: ${jug3 + poured}L`,
          variant: "default"
        });
      } else if (from === 3 && to === 5) {
        const space = JUG_5_MAX - jug5;
        const poured = Math.min(jug3, space);
        setJug3((p) => p - poured);
        setJug5((p) => p + poured);
        setMoveCount((p) => p + 1);
        toast({
          title: `Poured ${poured}L → 5L Jug`,
          description: `5L: ${jug5 + poured}L | 3L: ${jug3 - poured}L`,
          variant: "default"
        });
      }
    } else if (resetMatch) {
      setJug5(0);
      setJug3(0);
      setIsSuccess(false);
      setMoveCount(0);
      toast({
        title: "Level Reset",
        description: "Both jugs emptied. Start fresh!",
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

  // Jug rendering helper
  const renderJug = (x, label, capacity, current, color) => {
    const jugWidth = 60;
    const jugHeight = 100;
    const jugY = 100;
    const innerPad = 3;
    const innerH = jugHeight - innerPad * 2;
    const waterHeight = current > 0 ? (current / capacity) * innerH : 0;
    const clipId = `jug-clip-${capacity}`;

    return (
      <g>
        {/* Clip path to constrain water inside the jug */}
        <defs>
          <clipPath id={clipId}>
            <rect
              x={x + innerPad}
              y={jugY + innerPad}
              width={jugWidth - innerPad * 2}
              height={innerH}
              rx="3"
            />
          </clipPath>
        </defs>
        {/* Jug outline */}
        <rect
          x={x}
          y={jugY}
          width={jugWidth}
          height={jugHeight}
          rx="6"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
        />
        {/* Jug inner bg */}
        <rect
          x={x + 2}
          y={jugY + 2}
          width={jugWidth - 4}
          height={jugHeight - 4}
          rx="4"
          fill="#0a0a1a"
        />
        {/* Water fill (clipped to jug interior) */}
        <g clipPath={`url(#${clipId})`}>
          <motion.rect
            x={x + innerPad}
            width={jugWidth - innerPad * 2}
            rx="3"
            fill="#2196F3"
            initial={false}
            animate={{
              height: waterHeight,
              y: jugY + jugHeight - innerPad - waterHeight
            }}
            transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
            opacity="0.8"
          />
          {/* Water surface shimmer */}
          {current > 0 && (
            <motion.line
              x1={x + 8}
              x2={x + jugWidth - 8}
              stroke="#64B5F6"
              strokeWidth="1.5"
              opacity="0.6"
              initial={false}
              animate={{
                y1: jugY + jugHeight - innerPad - waterHeight + 2,
                y2: jugY + jugHeight - innerPad - waterHeight + 2
              }}
              transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
            />
          )}
        </g>
        {/* Capacity markings */}
        {Array.from({ length: capacity }, (_, i) => {
          const markY = jugY + jugHeight - innerPad - ((i + 1) / capacity) * innerH;
          return (
            <g key={i}>
              <line
                x1={x + jugWidth - 8}
                y1={markY}
                x2={x + jugWidth - 2}
                y2={markY}
                stroke={color}
                strokeWidth="1"
                opacity="0.4"
              />
            </g>
          );
        })}
        {/* Current amount */}
        <text
          x={x + jugWidth / 2}
          y={jugY + jugHeight / 2 + 5}
          textAnchor="middle"
          fontSize="20"
          fill="white"
          fontWeight="bold"
          opacity="0.9"
        >
          {current}L
        </text>
        {/* Label */}
        <text
          x={x + jugWidth / 2}
          y={jugY - 8}
          textAnchor="middle"
          fontSize="12"
          fill={color}
          fontWeight="bold"
        >
          {label}
        </text>
        {/* Capacity label */}
        <text
          x={x + jugWidth / 2}
          y={jugY + jugHeight + 18}
          textAnchor="middle"
          fontSize="10"
          fill="#8888BB"
        >
          Max: {capacity}L
        </text>
      </g>
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
        Measure exactly 4 Liters in the 5L jug.
      </motion.p>

      {/* Scene */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-[#0a0a1a] dark:bg-[#0a0a1a] rounded-2xl p-4 shadow-lg border border-gray-700/30 w-full max-w-md relative overflow-hidden"
      >
        <svg viewBox="0 0 380 260" className="w-full">
          {/* Grid background */}
          {[...Array(16)].map((_, i) => (
            <line
              key={`vg${i}`}
              x1={i * 25}
              y1={0}
              x2={i * 25}
              y2={260}
              stroke="#1a1a3a"
              strokeWidth="0.5"
            />
          ))}
          {[...Array(11)].map((_, i) => (
            <line
              key={`hg${i}`}
              x1={0}
              y1={i * 25}
              x2={380}
              y2={i * 25}
              stroke="#1a1a3a"
              strokeWidth="0.5"
            />
          ))}

          {/* 5L Jug */}
          {renderJug(110, "5L JUG", JUG_5_MAX, jug5, "#F9DC34")}

          {/* 3L Jug */}
          {renderJug(220, "3L JUG", JUG_3_MAX, jug3, "#A78BFA")}

          {/* Pour arrow between jugs */}
          <g opacity="0.3">
            <line x1="175" y1="140" x2="215" y2="140" stroke="#F9DC34" strokeWidth="1.5" />
            <polygon points="213,136 220,140 213,144" fill="#F9DC34" />
            <line x1="215" y1="155" x2="175" y2="155" stroke="#A78BFA" strokeWidth="1.5" />
            <polygon points="177,151 170,155 177,159" fill="#A78BFA" />
          </g>




        </svg>
      </motion.div>



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
                    /theme
                  </span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">[dark/light]</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Switch between dark and light themes.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    /fill
                  </span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">[5L or 3L]</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Fill a jug completely from the tap.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    /empty
                  </span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">[5L or 3L]</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Empty a jug into the drain.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    /pour
                  </span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">[from] [to]</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Pour water from one jug to another (e.g., /pour 5L 3L).
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
                    Show available commands and hints.
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-[#F9DC34]">
                Hint:
              </h3>
              <p className="text-gray-600 dark:text-gray-300 italic text-sm">
                Three and five make eight, but four is the middle path you must forge.
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

export default Level15;