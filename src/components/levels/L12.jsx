"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

const PASSWORD = "unlock";
const CIPHER_TEXT = "XQORFN"; // Caesar shift +3 of "UNLOCK"
const CIPHER_SHIFT = 3;
const MAX_BRIGHTNESS = 5;

const Level12 = ({ onComplete }) => {
  const [inputValue, setInputValue] = useState("");
  const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [brightness, setBrightness] = useState(0); // 0 = black, 5 = full
  const [hasLooked, setHasLooked] = useState(false);
  const [decoded, setDecoded] = useState(false); // track if player has decoded
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Caesar decode helper
  const caesarDecode = (text, shift) => {
    return text.split("").map(ch => {
      if (ch >= "A" && ch <= "Z") {
        return String.fromCharCode(((ch.charCodeAt(0) - 65 - shift + 26) % 26) + 65);
      }
      if (ch >= "a" && ch <= "z") {
        return String.fromCharCode(((ch.charCodeAt(0) - 97 - shift + 26) % 26) + 97);
      }
      return ch;
    }).join("");
  };

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Access Granted!",
        description: "Cipher cracked — system unlocked!",
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

    const increaseBright = cmd.match(/^\/increase\s+brightness$/i);
    const decreaseBright = cmd.match(/^\/decrease\s+brightness$/i);
    const lookMatch = cmd.match(/^\/look$/i);
    const decodeMatch = cmd.match(/^\/decode\s+(\d+)\s+(.+)$/i);
    const enterMatch = cmd.match(/^\/enter\s+(.+)$/i);
    const resetMatch = cmd.match(/^\/reset$/i);
    const helpMatch = cmd.match(/^\/help$/i);

    if (increaseBright) {
      if (brightness >= MAX_BRIGHTNESS) {
        toast({
          title: "Max brightness!",
          description: "The screen is already at full brightness.",
          variant: "default"
        });
      } else {
        setBrightness((b) => b + 1);
        setHasLooked(false);
        toast({
          title: `Brightness: ${brightness + 1}/${MAX_BRIGHTNESS} ☀️`,
          description: brightness + 1 >= 3 ? "The screen is getting readable..." : "Still quite dim...",
          variant: "default"
        });
      }
    } else if (decreaseBright) {
      if (brightness <= 0) {
        toast({
          title: "Already off!",
          description: "The screen can't get any darker.",
          variant: "default"
        });
      } else {
        setBrightness((b) => b - 1);
        setHasLooked(false);
        toast({
          title: `Brightness: ${brightness - 1}/${MAX_BRIGHTNESS}`,
          description: "The screen dims...",
          variant: "default"
        });
      }
    } else if (lookMatch) {
      setHasLooked(true);
      if (brightness === 0) {
        toast({
          title: "Too dark!",
          description: "You can't see anything. The screen is completely black.",
          variant: "destructive"
        });
      } else if (brightness <= 2) {
        toast({
          title: "Barely visible... ",
          description: "You can make out some text but it's garbled. Increase brightness.",
          variant: "default"
        });
      } else if (brightness <= 4) {
        toast({
          title: "Encrypted text visible",
          description: `The screen reads: \"${CIPHER_TEXT}\" — this looks encoded...`,
          variant: "default"
        });
      } else {
        toast({
          title: "Full view",
          description: `Cipher: \"${CIPHER_TEXT}\" | Method: CAESAR | Shift: ${CIPHER_SHIFT}`,
          variant: "default"
        });
      }
    } else if (decodeMatch) {
      const shift = parseInt(decodeMatch[1]);
      const text = decodeMatch[2].trim();
      const result = caesarDecode(text, shift);
      if (result.toLowerCase() === PASSWORD) {
        setDecoded(true);
        toast({
          title: "Decrypted!",
          description: `"${text}" → "${result}" — That looks like the password!`,
          variant: "default"
        });
      } else {
        toast({
          title: `Decoded: "${result}"`,
          description: "Doesn't seem right... Try a different shift value.",
          variant: "default"
        });
      }
    } else if (enterMatch) {
      const guess = enterMatch[1].trim().toLowerCase();
      if (guess === PASSWORD) {
        setIsSuccess(true);
      } else {
        toast({
          title: "Wrong password ❌",
          description: brightness < 3
            ? "Can you read what's on screen?"
            : `"${guess}" is incorrect. Look at the screen carefully.`,
          variant: "destructive"
        });
      }
    } else if (resetMatch) {
      setBrightness(0);
      setHasLooked(false);
      setDecoded(false);
      setIsSuccess(false);
      toast({
        title: "Level Reset",
        description: "Screen returned to black.",
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

  // Visual brightness: 0 = fully black, 5 = fully visible
  const screenOpacity = brightness / MAX_BRIGHTNESS;
  const bgBrightness = Math.round(10 + (brightness / MAX_BRIGHTNESS) * 30); // 10 to 40

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
        The Cipher Lock — Decrypt the password.
      </motion.p>

      {/* Monitor */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-md relative"
      >
        {/* Monitor bezel */}
        <div className="bg-[#1a1a2e] rounded-2xl p-3 border border-[#333] shadow-lg">
          {/* Screen */}
          <motion.div
            animate={{
              backgroundColor: `rgb(${bgBrightness}, ${bgBrightness}, ${bgBrightness + 10})`,
            }}
            transition={{ duration: 0.6 }}
            className="rounded-lg relative overflow-hidden"
            style={{ minHeight: 220 }}
          >
            {/* Scanlines effect */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
              }}
            />

            {/* Screen content */}
            <div className="relative z-0 flex flex-col items-center justify-center h-full p-6 font-mono" style={{ minHeight: 260 }}>

              {/* System log header */}
              <motion.p
                animate={{ opacity: Math.min(screenOpacity * 1.5, 1) }}
                className="text-[10px] self-start mb-3"
                style={{ color: `rgba(100, 100, 140, ${screenOpacity * 0.7})` }}
              >
                {brightness >= 1 ? "> SYSTEM AUTH v2.8.47" : ""}
              </motion.p>

              {/* Cipher display area */}
              <div className="relative mb-3 w-full">
                <motion.div
                  animate={{ opacity: screenOpacity }}
                  transition={{ duration: 0.5 }}
                  className="text-center space-y-2"
                >
                  {/* Encoded password - main cipher text */}
                  <p
                    className="text-3xl font-bold tracking-[0.3em]"
                    style={{
                      color: `rgba(239, 68, 68, ${screenOpacity})`,
                      textShadow: brightness >= 3
                        ? "0 0 12px rgba(239, 68, 68, 0.4)"
                        : "none",
                    }}
                  >
                    {brightness >= 3 ? CIPHER_TEXT : brightness >= 1 ? "██████" : ""}
                  </p>

                  {/* Method label */}
                  <p
                    className="text-xs tracking-wider"
                    style={{ color: `rgba(74, 222, 128, ${brightness >= 3 ? screenOpacity * 0.6 : 0})` }}
                  >
                    {brightness >= 3 ? "METHOD: CAESAR" : ""}
                  </p>

                  {/* Shift key - only visible at high brightness */}
                  <p
                    className="text-xs tracking-wider"
                    style={{ color: `rgba(249, 220, 52, ${brightness >= 5 ? 0.8 : brightness >= 4 ? 0.15 : 0})` }}
                  >
                    {brightness >= 4 ? `SHIFT: ${CIPHER_SHIFT}` : ""}
                  </p>
                </motion.div>
              </div>

              {/* Password input field visual on screen */}
              <motion.div
                animate={{ opacity: 0.05 + screenOpacity * 0.8 }}
                transition={{ duration: 0.5 }}
                className="w-48 border rounded px-3 py-1.5 text-center text-sm"
                style={{
                  borderColor: `rgba(120, 120, 180, ${0.1 + screenOpacity * 0.5})`,
                  color: `rgba(200, 200, 220, ${screenOpacity * 0.8})`,
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                }}
              >
                {decoded ? "✓ decrypted" : "Enter password..."}
              </motion.div>

              {/* Look result overlay */}
              {hasLooked && brightness >= 5 && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 0.7 }}
                  className="mt-3 text-[10px]"
                  style={{ color: "rgba(249, 220, 52, 0.8)" }}
                >
                  ⚠ ENCRYPTED — use /decode to crack
                </motion.p>
              )}
              {hasLooked && brightness >= 3 && brightness < 5 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  className="mt-3 text-[10px] text-gray-400"
                >
                  ... something below the cipher is too faint ...
                </motion.p>
              )}
              {hasLooked && brightness > 0 && brightness < 3 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  className="mt-3 text-[10px] text-gray-500"
                >
                  ... too dim to read clearly ...
                </motion.p>
              )}
            </div>

            {/* Brightness indicator on screen */}
            <div className="absolute bottom-2 right-3 flex gap-0.5 z-20">
              {Array.from({ length: MAX_BRIGHTNESS }, (_, i) => (
                <div
                  key={i}
                  className="w-2 h-3 rounded-sm"
                  style={{
                    backgroundColor: i < brightness
                      ? `rgba(249, 220, 52, ${0.3 + (brightness / MAX_BRIGHTNESS) * 0.7})`
                      : `rgba(60, 60, 80, ${0.1 + screenOpacity * 0.3})`,
                  }}
                />
              ))}
            </div>

            {/* Power LED */}
            <div className="absolute bottom-2 left-3 z-20">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: brightness > 0 ? "#22c55e" : "#333",
                  boxShadow: brightness > 0 ? "0 0 4px #22c55e" : "none",
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Monitor stand */}
        <div className="flex justify-center mt-1">
          <div className="w-16 h-3 bg-[#333] rounded-t-sm" />
        </div>
        <div className="flex justify-center">
          <div className="w-28 h-2 bg-[#2a2a3a] rounded-b-lg" />
        </div>
      </motion.div>

      {/* Brightness bar */}


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
                    /increase brightness
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Turn up the screen brightness by one level.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    /decrease brightness
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Turn down the screen brightness by one level.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    /look
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Look carefully at the screen to read what's displayed.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    /decode
                  </span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">[shift] [text]</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Decrypt text using a Caesar cipher with the given shift.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    /enter
                  </span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">[password]</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Enter the decrypted password.
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
                Summon the sun to reveal the truth. But even in light, the letters wear a mask.
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

export default Level12;