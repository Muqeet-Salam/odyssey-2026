"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

const CORRECT_PIN = "0720"; // July 20 → 07/20

const Level12 = ({ onComplete }) => {
  const [inputValue, setInputValue] = useState("");
  const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [shake, setShake] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Drawer Unlocked! 🔓",
        description: "The PIN was 0720 — July 20th!",
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
    const cmd = inputValue.trim();

    const enterMatch = cmd.match(/^\/enter\s+(.+)$/i);
    const resetMatch = cmd.match(/^\/reset$/i);
    const helpMatch = cmd.match(/^\/help$/i);

    if (enterMatch) {
      const pin = enterMatch[1].trim();

      if (!/^\d{4}$/.test(pin)) {
        toast({
          title: "Invalid PIN",
          description: "The keypad accepts exactly 4 digits.",
          variant: "destructive"
        });
      } else if (pin === CORRECT_PIN) {
        setIsSuccess(true);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setAttempts((prev) => [...prev, pin]);
        toast({
          title: "Wrong PIN ❌",
          description: `"${pin}" is incorrect. Think about the date...`,
          variant: "destructive"
        });
      }
    } else if (resetMatch) {
      setAttempts([]);
      setIsSuccess(false);
      toast({
        title: "Level Reset",
        description: "Try again from scratch.",
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

  return (
    <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">
      {/* Theme Toggle Button */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors border border-purple-300 dark:border-purple-600"
        aria-label="Toggle theme"
      >
        <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-purple-700" />
        <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-purple-300 top-2 left-2" />
      </button>
      {/* Level title badge - now in sticky header */}

      {/* Question */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8 text-xl font-semibold mb-4 text-center text-purple-900 dark:text-[#F9DC34]"
      >
        The Locked Drawer — Enter the 4-digit PIN.
      </motion.p>

      {/* Scene */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-[#0a0a1a] dark:bg-[#0a0a1a] rounded-2xl p-4 shadow-lg border border-purple-700/30 w-full max-w-md relative overflow-hidden"
      >
        <svg viewBox="0 0 380 280" className="w-full">
          {/* Room background */}
          <rect x="0" y="0" width="380" height="280" fill="#0d0d1a" />

          {/* Wall */}
          {[...Array(11)].map((_, i) => (
            <line key={`w${i}`} x1={0} y1={i * 28} x2={380} y2={i * 28} stroke="#141428" strokeWidth="0.5" />
          ))}

          {/* Scene title */}
          <text x="190" y="18" textAnchor="middle" fontSize="10" fill="#555577" fontWeight="bold">
            THE LOCKED DRAWER
          </text>

          {/* === DESK CALENDAR (left side, on table) === */}
          <motion.g
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* Calendar base/stand */}
            <rect x="30" y="195" width="130" height="4" rx="2" fill="#8D6E63" />
            {/* Calendar back page (shadow) */}
            <rect x="37" y="85" width="120" height="112" rx="3" fill="#E8E0D0" stroke="#CCC" strokeWidth="0.5" />
            {/* Calendar front page */}
            <rect x="34" y="87" width="120" height="112" rx="3" fill="#FFF8E1" stroke="#DDD" strokeWidth="1" />

            {/* Month header band */}
            <rect x="34" y="87" width="120" height="16" rx="3" fill="#e53935" />
            <text x="94" y="99" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" letterSpacing="2">
              JULY
            </text>

            {/* Day-of-week headers */}
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <text
                key={`dh${i}`}
                x={42 + i * 16}
                y={113}
                textAnchor="middle"
                fontSize="6"
                fill="#999"
                fontWeight="bold"
              >
                {d}
              </text>
            ))}

            {/* Day number grid — July 1 = Tuesday (col index 2) */}
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const cellIndex = i + 2;
              const row = Math.floor(cellIndex / 7);
              const col = cellIndex % 7;
              const cx = 42 + col * 16;
              const cy = 123 + row * 13;
              const isMarked = day === 20;

              return (
                <g key={`day${day}`}>
                  {isMarked && (
                    <circle cx={cx} cy={cy - 1} r="7" fill="none" stroke="#e53935" strokeWidth="1.5" />
                  )}
                  <text
                    x={cx}
                    y={cy + 2}
                    textAnchor="middle"
                    fontSize="7"
                    fill={isMarked ? "#e53935" : "#333"}
                    fontWeight={isMarked ? "bold" : "normal"}
                  >
                    {day}
                  </text>
                </g>
              );
            })}

            {/* Calendar label */}
            <text x="94" y="210" textAnchor="middle" fontSize="8" fill="#8888AA">
              📅 DESK CALENDAR
            </text>
          </motion.g>

          {/* === STICKY NOTE (center, on wall above table) === */}
          <motion.g
            initial={{ opacity: 0, rotate: -5 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <rect x="170" y="35" width="55" height="40" rx="1" fill="#FFEE58" />
            <polygon points="225,35 225,45 215,35" fill="#FDD835" />
            <text x="197" y="50" textAnchor="middle" fontSize="7" fill="#5D4037" fontStyle="italic">
              "Don't forget
            </text>
            <text x="197" y="60" textAnchor="middle" fontSize="7" fill="#5D4037" fontStyle="italic">
              the big day."
            </text>
            <text x="197" y="70" textAnchor="middle" fontSize="6" fill="#8D6E63">
              — CC
            </text>
          </motion.g>

          {/* === TABLE SURFACE === */}
          <rect x="20" y="200" width="340" height="10" rx="2" fill="#6D4C41" stroke="#5D4037" strokeWidth="1" />
          <rect x="25" y="210" width="330" height="3" fill="#5D4037" />
          {/* Table legs */}
          <rect x="40" y="213" width="8" height="47" fill="#5D4037" rx="1" />
          <rect x="332" y="213" width="8" height="47" fill="#5D4037" rx="1" />

          {/* === KEYPAD LOCKER (ON TOP OF TABLE) === */}
          <motion.g
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {/* Locker body */}
            <rect x="235" y="80" width="120" height="118" rx="6" fill="#37474F" stroke="#263238" strokeWidth="2" />
            <rect x="241" y="86" width="108" height="106" rx="4" fill="#455A64" stroke="#37474F" strokeWidth="1" />

            {/* Lock / unlock indicator */}
            <text x="295" y="102" textAnchor="middle" fontSize="14" fill={isSuccess ? "#22c55e" : "#FF6B6B"}>
              {isSuccess ? "🔓" : "🔒"}
            </text>

            {/* PIN display */}
            <motion.rect
              x="254"
              y="108"
              width="82"
              height="22"
              rx="3"
              fill="#0a0a15"
              stroke={isSuccess ? "#22c55e" : shake ? "#ef4444" : "#333"}
              strokeWidth="1.5"
              animate={shake ? { x: [254, 258, 250, 257, 251, 254] } : {}}
              transition={{ duration: 0.4 }}
            />

            {/* PIN dots or text */}
            {isSuccess ? (
              <text x="295" y="124" textAnchor="middle" fontSize="14" fill="#22c55e" fontFamily="monospace" fontWeight="bold">
                0720
              </text>
            ) : (
              <text x="295" y="124" textAnchor="middle" fontSize="14" fill="#444" fontFamily="monospace">
                ----
              </text>
            )}

            {/* Keypad buttons (3x3 grid + 0) */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n, i) => {
              const row = Math.floor(i / 3);
              const col = i % 3;
              return (
                <g key={n}>
                  <rect
                    x={254 + col * 28}
                    y={136 + row * 16}
                    width="24"
                    height="13"
                    rx="2"
                    fill="#263238"
                    stroke="#37474F"
                    strokeWidth="0.5"
                  />
                  <text
                    x={266 + col * 28}
                    y={146 + row * 16}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#90A4AE"
                    fontWeight="bold"
                  >
                    {n}
                  </text>
                </g>
              );
            })}
            {/* Zero button */}
            <rect x="282" y="184" width="24" height="13" rx="2" fill="#263238" stroke="#37474F" strokeWidth="0.5" />
            <text x="294" y="194" textAnchor="middle" fontSize="8" fill="#90A4AE" fontWeight="bold">0</text>

            {/* Locker label */}
            <text x="295" y="76" textAnchor="middle" fontSize="8" fill="#8888AA">
              KEYPAD LOCKER
            </text>
          </motion.g>

          {/* Floor */}
          <rect x="0" y="260" width="380" height="20" fill="#111122" />
        </svg>
      </motion.div>

      {/* Attempt history */}
      {attempts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-md mt-3 flex flex-wrap justify-center gap-2"
        >
          {attempts.map((a, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-mono"
            >
              {a} ✗
            </span>
          ))}
        </motion.div>
      )}

      {/* Sticky Command Panel */}
      <div className="sticky bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#1A0F2E] via-[#1A0F2E]/95 to-transparent backdrop-blur-sm border-t border-purple-500/20 py-4 mt-8">
        <div className="flex flex-col items-center gap-3 max-w-4xl mx-auto px-4">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm text-center cursor-pointer text-purple-700 dark:text-purple-300 hover:text-[#F5A623] dark:hover:text-[#F9DC34] transition-colors"
            onClick={() => setHelpModalOpen(true)}
          >
            Type{" "}
            <span className="font-mono bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">
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
              className="border-purple-300 dark:border-purple-600/50 bg-white dark:bg-[#1A0F2E]/70 shadow-inner focus:ring-[#F5A623] focus:border-[#F9DC34]"
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
            className="bg-white dark:bg-[#2D1B4B] rounded-xl overflow-hidden shadow-2xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
          >
            <div className="p-6 overflow-y-auto flex-grow">
              <h2 className="text-2xl font-bold mb-4 text-purple-800 dark:text-[#F9DC34]">
                Available Commands:
              </h2>
              <div className="space-y-1 mb-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    /enter
                  </span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">[4-digit PIN]</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Try a 4-digit PIN on the keypad. e.g., <code>/enter 1234</code>
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    /reset
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Reset the level.
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    /help
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Show commands and hints.
                  </p>
                </div>
              </div>



              <h3 className="text-xl font-bold mb-2 text-purple-800 dark:text-[#F9DC34]">
                Hint:
              </h3>
              <p className="text-gray-600 dark:text-gray-300 italic">
                The calendar holds the key to the 'big day'.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/30 px-6 py-4 text-center flex-shrink-0">
              <button
                onClick={closeHelpModal}
                className="bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] px-6 py-2 rounded-lg text-purple-900 font-medium shadow-md transition-transform hover:scale-105"
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

export default Level12;