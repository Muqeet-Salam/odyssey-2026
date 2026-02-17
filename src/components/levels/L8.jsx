
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";

const CORRECT_PIN = "8520";

const Level8 = ({ onComplete }) => {
  const [inputValue, setInputValue] = useState("");
  const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [numLock, setNumLock] = useState(false);
  const [capsLock] = useState(false);
  const [scrollLock] = useState(false);
  const [enteredDigits, setEnteredDigits] = useState([]);
  const [shake, setShake] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Keypad Unlocked!",
        description: `PIN ${CORRECT_PIN} accepted!`,
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

    const pressMatch = cmd.match(/^\/press\s+(\d)$/i);
    const toggleMatch = cmd.match(/^\/toggle\s+numlock$/i);
    const submitMatch = cmd.match(/^\/submit$/i);
    const lookMatch = cmd.match(/^\/look$/i);
    const resetMatch = cmd.match(/^\/reset$/i);
    const helpMatch = cmd.match(/^\/help$/i);

    if (pressMatch) {
      const digit = pressMatch[1];
      if (!numLock) {
        toast({
          title: "Nothing happened",
          description: "You press the key but the display doesn't change...",
          variant: "default"
      });
      } else if (enteredDigits.length >= 4) {
        toast({
          title: "Display full",
          description: "Already 4 digits entered. Use /submit or /reset.",
          variant: "default"
      });
      } else {
        setEnteredDigits((prev) => [...prev, digit]);
        toast({
          title: `Digit entered: ${digit}`,
          description: `Display: ${[...enteredDigits, digit].join("")}${"–".repeat(4 - enteredDigits.length - 1)}`,
          variant: "default"
      });
      }
    } else if (toggleMatch) {
      setNumLock((prev) => !prev);
      toast({
        title: `Num Lock ${!numLock ? "ON" : "OFF"}`,
        description: !numLock
          ? "The Num Lock LED lights up green. Number keys should work now!"
          : "The Num Lock LED goes dark.",
        variant: "default"
      });
    } else if (submitMatch) {
      if (enteredDigits.length < 4) {
        toast({
          title: "Not enough digits",
          description: `Only ${enteredDigits.length}/4 digits entered.`,
          variant: "destructive"
      });
      } else {
        const pin = enteredDigits.join("");
        if (pin === CORRECT_PIN) {
          setIsSuccess(true);
        } else {
          setShake(true);
          setTimeout(() => setShake(false), 500);
          setEnteredDigits([]);
          toast({
            title: "Wrong PIN ❌",
            description: `"${pin}" is incorrect. Display cleared.`,
            variant: "destructive"
      });
        }
      }
    } else if (lookMatch) {
      const ledInfo = `Num Lock: ${numLock ? "🟢 ON" : "⚫ OFF"}\nCaps Lock: ⚫ OFF\nScroll Lock: ⚫ OFF`;
      if (!numLock) {
        toast({
          title: "You examine the keypad... 👀",
          description: "Three LEDs at the top. Num Lock is OFF. The display shows \"----\". There's a sticky note with arrows: ↓ straight down the middle.",
          variant: "default"
      });
      } else {
        toast({
          title: "You examine the keypad... 👀",
          description: `Num Lock is ON. Display: ${enteredDigits.length > 0 ? enteredDigits.join("") : "----"}. The sticky note shows arrows pointing down the middle column.`,
          variant: "default"
      });
      }
    } else if (resetMatch) {
      setNumLock(false);
      setEnteredDigits([]);
      setIsSuccess(false);
      setShake(false);
      toast({
        title: "Level Reset",
        description: "Keypad restored. Num Lock OFF.",
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

  // Build the display string
  const displayStr = enteredDigits.length > 0
    ? enteredDigits.join("") + "–".repeat(4 - enteredDigits.length)
    : "––––";

  return (
    <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">
      {/* Level title badge - now in sticky header */}

      {/* Question */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8 text-xl font-semibold mb-4 text-center text-gray-900 dark:text-[#F9DC34]"
      >
        The Numpad Lock — Enter the 4-digit PIN.
      </motion.p>

      {/* Scene */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-[#0a0a1a] rounded-2xl p-4 shadow-lg border border-gray-700/30 w-full max-w-md relative overflow-hidden"
      >
        <svg viewBox="0 0 380 280" className="w-full">
          {/* Background */}
          <rect x="0" y="0" width="380" height="280" fill="#0d0d1a" />

          {/* Wall pattern */}
          {[...Array(11)].map((_, i) => (
            <line key={`w${i}`} x1={0} y1={i * 28} x2={380} y2={i * 28} stroke="#141428" strokeWidth="0.5" />
          ))}

          {/* Title */}
          <text x="190" y="18" textAnchor="middle" fontSize="10" fill="#555577" fontWeight="bold">
            THE NUMPAD LOCK
          </text>

          {/* === STICKY NOTE (top left) === */}
          <g>
            <rect x="25" y="30" width="80" height="55" rx="1" fill="#FFEE58" />
            <polygon points="105,30 105,42 93,30" fill="#FDD835" />
            <text x="65" y="45" textAnchor="middle" fontSize="7" fill="#5D4037" fontStyle="italic">
              Follow the
            </text>
            <text x="65" y="55" textAnchor="middle" fontSize="7" fill="#5D4037" fontStyle="italic">
              middle path
            </text>
            <text x="65" y="68" textAnchor="middle" fontSize="22" fill="#e53935" fontWeight="bold">
              ↓
            </text>
            <text x="65" y="95" textAnchor="middle" fontSize="7" fill="#8888AA">
              📝 STICKY NOTE
            </text>
          </g>

          {/* === KEYPAD DEVICE (center) === */}
          <g>
            {/* Device body */}
            <rect x="130" y="28" width="120" height="230" rx="8" fill="#263238" stroke="#37474F" strokeWidth="2" />
            <rect x="136" y="34" width="108" height="218" rx="6" fill="#37474F" />

            {/* === LED INDICATORS === */}
            <g>
              {/* Num Lock LED */}
              <circle cx="155" cy="46" r="4" fill={numLock ? "#22c55e" : "#1a1a1a"} stroke="#444" strokeWidth="0.5" />
              {numLock && <circle cx="155" cy="46" r="7" fill="#22c55e" opacity="0.2" />}
              <text x="155" y="56" textAnchor="middle" fontSize="5" fill={numLock ? "#22c55e" : "#666"}>
                NUM
              </text>

              {/* Caps Lock LED */}
              <circle cx="190" cy="46" r="4" fill={capsLock ? "#22c55e" : "#1a1a1a"} stroke="#444" strokeWidth="0.5" />
              <text x="190" y="56" textAnchor="middle" fontSize="5" fill="#666">
                CAPS
              </text>

              {/* Scroll Lock LED */}
              <circle cx="225" cy="46" r="4" fill={scrollLock ? "#22c55e" : "#1a1a1a"} stroke="#444" strokeWidth="0.5" />
              <text x="225" y="56" textAnchor="middle" fontSize="5" fill="#666">
                SCROLL
              </text>
            </g>

            {/* === PIN DISPLAY === */}
            <motion.rect
              x="142"
              y="62"
              width="96"
              height="28"
              rx="4"
              fill="#0a0a15"
              stroke={isSuccess ? "#22c55e" : shake ? "#ef4444" : "#333"}
              strokeWidth="1.5"
              animate={shake ? { x: [142, 146, 138, 145, 139, 142] } : {}}
              transition={{ duration: 0.4 }}
            />
            {/* Display text */}
            <text
              x="190"
              y="82"
              textAnchor="middle"
              fontSize="18"
              fill={isSuccess ? "#22c55e" : numLock && enteredDigits.length > 0 ? "#4ADE80" : "#333"}
              fontFamily="monospace"
              fontWeight="bold"
              letterSpacing="6"
            >
              {isSuccess ? CORRECT_PIN : displayStr}
            </text>

            {/* === NUMBER KEYS (3x3 + bottom row) === */}
            {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((n, i) => {
              const row = Math.floor(i / 3);
              const col = i % 3;
              const kx = 146 + col * 32;
              const ky = 100 + row * 30;
              return (
                <g key={`key${n}`}>
                  <rect
                    x={kx}
                    y={ky}
                    width="28"
                    height="24"
                    rx="4"
                    fill="#455A64"
                    stroke="#546E7A"
                    strokeWidth="1"
                  />
                  <rect
                    x={kx + 1}
                    y={ky + 1}
                    width="26"
                    height="20"
                    rx="3"
                    fill="#546E7A"
                  />
                  <text
                    x={kx + 14}
                    y={ky + 15}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#CFD8DC"
                    fontWeight="bold"
                  >
                    {n}
                  </text>
                </g>
              );
            })}

            {/* 0 key (wider, bottom center) */}
            <g>
              <rect x="146" y="190" width="60" height="24" rx="4" fill="#455A64" stroke="#546E7A" strokeWidth="1" />
              <rect x="147" y="191" width="58" height="20" rx="3" fill="#546E7A" />
              <text x="176" y="205" textAnchor="middle" fontSize="11" fill="#CFD8DC" fontWeight="bold">
                0
              </text>
            </g>

            {/* Enter key */}
            <g>
              <rect x="210" y="190" width="28" height="24" rx="4" fill="#1B5E20" stroke="#2E7D32" strokeWidth="1" />
              <rect x="211" y="191" width="26" height="20" rx="3" fill="#2E7D32" />
              <text x="224" y="204" textAnchor="middle" fontSize="7" fill="#C8E6C9" fontWeight="bold">
                ENT
              </text>
            </g>

            {/* Num Lock toggle key label */}
            <g>
              <rect x="146" y="222" width="92" height="20" rx="4" fill={numLock ? "#1B5E20" : "#4A148C"} stroke={numLock ? "#2E7D32" : "#6A1B9A"} strokeWidth="1" />
              <rect x="147" y="223" width="90" height="16" rx="3" fill={numLock ? "#2E7D32" : "#6A1B9A"} />
              <text x="192" y="234" textAnchor="middle" fontSize="7" fill={numLock ? "#C8E6C9" : "#CE93D8"} fontWeight="bold">
                NUM LOCK {numLock ? "● ON" : "○ OFF"}
              </text>
            </g>
          </g>

          {/* === HINT AREA (right side) === */}
          <g>
            {/* Arrow from sticky note */}
            <line x1="105" y1="60" x2="130" y2="76" stroke="#F9DC34" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />

            {/* Info panel */}
            <rect x="262" y="60" width="105" height="100" rx="6" fill="#1a1a2e" stroke="#333" strokeWidth="1" />
            <text x="314" y="78" textAnchor="middle" fontSize="8" fill="#8888AA" fontWeight="bold">
              LED STATUS
            </text>
            <line x1="272" y1="83" x2="357" y2="83" stroke="#333" strokeWidth="0.5" />

            {/* Num Lock status */}
            <circle cx="280" cy="97" r="3" fill={numLock ? "#22c55e" : "#333"} />
            <text x="288" y="100" fontSize="8" fill={numLock ? "#22c55e" : "#666"}>
              Num Lock: {numLock ? "ON" : "OFF"}
            </text>

            {/* Caps Lock status */}
            <circle cx="280" cy="115" r="3" fill="#333" />
            <text x="288" y="118" fontSize="8" fill="#666">
              Caps Lock: OFF
            </text>

            {/* Scroll Lock status */}
            <circle cx="280" cy="133" r="3" fill="#333" />
            <text x="288" y="136" fontSize="8" fill="#666">
              Scroll Lock: OFF
            </text>

            {/* Hint if num lock is off */}
            {!numLock && (
              <text x="314" y="152" textAnchor="middle" fontSize="6" fill="#F9DC34" opacity="0.6">
                ⚠ Num Lock is off...
              </text>
            )}
          </g>

          {/* Digits entered indicator */}
          <g>
            <text x="314" y="190" textAnchor="middle" fontSize="8" fill="#8888AA">
              Digits: {enteredDigits.length}/4
            </text>
            <g>
              {[0, 1, 2, 3].map((i) => (
                <rect
                  key={`di${i}`}
                  x={290 + i * 14}
                  y="196"
                  width="10"
                  height="10"
                  rx="2"
                  fill={i < enteredDigits.length ? "#22c55e" : "#1a1a2e"}
                  stroke={i < enteredDigits.length ? "#22c55e" : "#333"}
                  strokeWidth="1"
                />
              ))}
            </g>
          </g>

          {/* Floor */}
          <rect x="0" y="268" width="380" height="12" fill="#111122" />
        </svg>
      </motion.div>

      {/* Status bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full max-w-md mt-3 flex justify-center gap-3"
      >
        <div className={`text-xs px-3 py-1 rounded-full border ${numLock
            ? "bg-green-500/20 text-green-400 border-green-500/40"
            : "bg-red-500/20 text-red-400 border-red-500/40"
          }`}>
          Num Lock: {numLock ? "🟢 ON" : "🔴 OFF"}
        </div>
        <div className={`text-xs px-3 py-1 rounded-full border ${enteredDigits.length === 4
            ? "bg-green-500/20 text-green-400 border-green-500/40"
            : "bg-gray-500/20 text-gray-300 border-gray-500/40"
          }`}>
          PIN: {enteredDigits.length}/4 digits
        </div>
      </motion.div>

      {/* Help prompt */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mx-10 my-6 text-center cursor-pointer text-gray-700 dark:text-gray-300 hover:text-[#F5A623] dark:hover:text-[#F9DC34] transition-colors"
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
                    /press
                  </span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">[0–9]</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Press a number key on the keypad.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    /toggle numlock
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Toggle the Num Lock key on or off.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    /submit
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Submit the 4-digit PIN on the display.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    /look
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Observe the keypad, LEDs, and surroundings.
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
                Hint:
              </h3>
              <p className="text-gray-600 dark:text-gray-300 italic">
                The keys are silent until the lock is broken. Find the spark to wake them.
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

export default Level8;
