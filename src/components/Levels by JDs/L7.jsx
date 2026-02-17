"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

const WORK_START = 9;
const WORK_END = 17;

const Level13 = ({ onComplete }) => {
  const [inputValue, setInputValue] = useState("");
  const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentHour, setCurrentHour] = useState(2);
  const [currentMin, setCurrentMin] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [terminalLines, setTerminalLines] = useState([
    { text: "COSC OFFICE SYSTEM v3.1", color: "#4ADE80" },
    { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━", color: "#333" },
    { text: "Login restricted to working hours.", color: "#F9DC34" },
    { text: `Working Hours: 09:00 – 17:00`, color: "#8888BB" },
    { text: `Current Time: 02:00`, color: "#8888BB" },
  ]);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Access Granted! 🖥️✨",
        description: "You changed the system clock and logged in!",
        variant: "success"
      });
      setTimeout(() => {
        onComplete(4);
      }, 2000);
    }
  }, [isSuccess, onComplete, toast]);

  const addLine = (text, color = "#ccc") => {
    setTerminalLines((prev) => [...prev, { text, color }]);
  };

  const formatTime = (h, m) => {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const isWorkingHours = (h) => h >= WORK_START && h < WORK_END;

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

    const loginMatch = cmd.match(/^\/login$/i);
    const openSettingsMatch = cmd.match(/^\/open\s+settings$/i);
    const setTimeMatch = cmd.match(/^\/set\s+time\s+(\d{1,2}):(\d{2})$/i);
    const resetMatch = cmd.match(/^\/reset$/i);
    const helpMatch = cmd.match(/^\/help$/i);

    if (loginMatch) {
      addLine(`> /login`, "#A78BFA");
      if (isWorkingHours(currentHour)) {
        addLine("✓ ACCESS GRANTED", "#22c55e");
        addLine("Welcome to COSC Office System.", "#22c55e");
        setIsSuccess(true);
      } else {
        addLine("✗ ACCESS DENIED — Outside Working Hours", "#ef4444");
        addLine(`  Current time: ${formatTime(currentHour, currentMin)}`, "#666");
        addLine(`  Working hours: 09:00 – 17:00`, "#666");
        toast({
          title: "Access Denied ❌",
          description: `Current time is ${formatTime(currentHour, currentMin)}. Working hours are 09:00–17:00.`,
          variant: "destructive"
        });
      }
    } else if (openSettingsMatch) {
      addLine(`> /open settings`, "#A78BFA");
      if (settingsOpen) {
        addLine("Settings panel is already open.", "#F9DC34");
      } else {
        setSettingsOpen(true);
        addLine("⚙ Settings panel opened.", "#F9DC34");
        addLine("  Use /set time HH:MM to change system clock.", "#666");
      }
    } else if (setTimeMatch) {
      const h = parseInt(setTimeMatch[1]);
      const m = parseInt(setTimeMatch[2]);
      addLine(`> /set time ${formatTime(h, m)}`, "#A78BFA");

      if (!settingsOpen) {
        addLine("✗ Settings panel not open. Use /open settings first.", "#ef4444");
        toast({
          title: "Settings not open",
          description: "Open settings first with /open settings",
          variant: "destructive"
        });
      } else if (h < 0 || h > 23 || m < 0 || m > 59) {
        addLine("✗ Invalid time. Use format HH:MM (00:00 – 23:59).", "#ef4444");
      } else {
        setCurrentHour(h);
        setCurrentMin(m);
        addLine(`✓ System clock set to ${formatTime(h, m)}`, "#4ADE80");
        if (isWorkingHours(h)) {
          addLine("  Time is now within working hours.", "#4ADE80");
        } else {
          addLine("  Time is still outside working hours.", "#F9DC34");
        }
        toast({
          title: `Clock set to ${formatTime(h, m)}`,
          description: isWorkingHours(h)
            ? "Now within working hours! Try /login"
            : "Still outside working hours.",
          variant: "default"
        });
      }
    } else if (resetMatch) {
      setCurrentHour(2);
      setCurrentMin(0);
      setSettingsOpen(false);
      setIsSuccess(false);
      setTerminalLines([
        { text: "COSC OFFICE SYSTEM v3.1", color: "#4ADE80" },
        { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━", color: "#333" },
        { text: "Login restricted to working hours.", color: "#F9DC34" },
        { text: `Working Hours: 09:00 – 17:00`, color: "#8888BB" },
        { text: `Current Time: 02:00`, color: "#8888BB" },
        { text: "", color: "#333" },
        { text: "Type /login to attempt access.", color: "#666" },
      ]);
      toast({
        title: "Level Reset",
        description: "Terminal restored to initial state.",
        variant: "default"
      });
    } else if (helpMatch) {
      setHelpModalOpen(true);
    } else {
      addLine(`> ${cmd}`, "#A78BFA");
      addLine("✗ Unrecognized command. Type /help for options.", "#ef4444");
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
        The Office System — Log in to the terminal.
      </motion.p>

      {/* Terminal Scene */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-[#0a0a1a] rounded-2xl p-1 shadow-lg border border-purple-700/30 w-full max-w-md relative overflow-hidden"
      >
        {/* Monitor bezel */}
        <div className="bg-[#1a1a2e] rounded-xl p-3 border border-[#333]">
          {/* Screen top bar */}
          <div className="flex items-center justify-between bg-[#111] rounded-t-lg px-3 py-1.5 border-b border-[#222]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#F9DC34]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
            </div>
            <span className="text-[10px] text-[#555] font-mono">COSC Terminal</span>
            <div className="flex items-center gap-2">
              {settingsOpen && (
                <span className="text-[9px] text-[#F9DC34] font-mono">⚙ SETTINGS</span>
              )}
              <span className={`text-[10px] font-mono ${isWorkingHours(currentHour) ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                {formatTime(currentHour, currentMin)}
              </span>
            </div>
          </div>

          {/* Terminal output */}
          <div className="bg-[#0a0a12] rounded-b-lg p-3 h-52 overflow-y-auto font-mono text-xs leading-relaxed"
            style={{ scrollBehavior: "smooth" }}
            ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}
          >
            {terminalLines.map((line, i) => (
              <motion.div
                key={i}
                initial={i > 6 ? { opacity: 0, x: -5 } : { opacity: 1 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                style={{ color: line.color }}
              >
                {line.text || "\u00A0"}
              </motion.div>
            ))}
            {/* Blinking cursor */}
            {!isSuccess && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="text-[#4ADE80]"
              >
                █
              </motion.span>
            )}
          </div>
        </div>

        {/* Monitor stand */}
        <div className="flex justify-center mt-1">
          <div className="w-16 h-2 bg-[#333] rounded-t-sm" />
        </div>
        <div className="flex justify-center">
          <div className="w-24 h-1.5 bg-[#2a2a3a] rounded-b-lg" />
        </div>
      </motion.div>



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
                    /login
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Attempt to log in to the system.
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    /open settings
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Open the system settings panel.
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    /set time
                  </span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">[HH:MM]</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Change the system clock. Requires settings to be open.
                    <br />
                    e.g., <code>/set time 10:00</code>
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
                Time is a cage; use the gears to shift the sun.
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

export default Level13;