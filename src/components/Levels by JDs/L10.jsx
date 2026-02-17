"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

// Use String.fromCodePoint to avoid file-encoding corruption
const EMOJI_WOLF = String.fromCodePoint(0x1F43A);    // Wolf face
const EMOJI_GOAT = String.fromCodePoint(0x1F411);    // Sheep (fluffy & cute)
const EMOJI_CABBAGE = String.fromCodePoint(0x1F33F); // Herb/seedling

const ITEMS = {
  wolf: { label: "Wolf", emoji: EMOJI_WOLF },
  goat: { label: "Sheep", emoji: EMOJI_GOAT },
  cabbage: { label: "Cabbage", emoji: EMOJI_CABBAGE },
};

// Dangerous pairs: if left alone on the same bank without the player
const DANGER_PAIRS = [
  { predator: "wolf", prey: "goat", msg: "The Wolf ate the Sheep!" },
  { predator: "goat", prey: "cabbage", msg: "The Sheep ate the Cabbage!" },
];

const Level5 = ({ onComplete }) => {
  const [inputValue, setInputValue] = useState("");
  const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [failMessage, setFailMessage] = useState("");
  const [playerSide, setPlayerSide] = useState("left"); // "left" or "right"
  const [leftBank, setLeftBank] = useState(["wolf", "goat", "cabbage"]);
  const [rightBank, setRightBank] = useState([]);
  const [boatItem, setBoatItem] = useState(null); // item being carried
  const [crossing, setCrossing] = useState(false); // animation state
  const [moveCount, setMoveCount] = useState(0);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Check win condition
  useEffect(() => {
    if (
      rightBank.length === 3 &&
      leftBank.length === 0 &&
      playerSide === "right" &&
      !isSuccess
    ) {
      setIsSuccess(true);
    }
  }, [rightBank, leftBank, playerSide, isSuccess]);

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Level Completed! 🎉",
        description: `All items crossed safely in ${moveCount} moves!`,
        variant: "success"
      });
      setTimeout(() => {
        onComplete(4);
      }, 2000);
    }
  }, [isSuccess, onComplete, toast, moveCount]);

  // Check for dangerous situation on banks
  const checkDanger = (left, right, side) => {
    // Check the bank the player is NOT on
    const unattendedBank = side === "left" ? right : left;
    for (const pair of DANGER_PAIRS) {
      if (
        unattendedBank.includes(pair.predator) &&
        unattendedBank.includes(pair.prey)
      ) {
        return pair.msg;
      }
    }
    return null;
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleCommandSubmit();
    }
  };

  const performCrossing = (item) => {
    if (crossing) return;
    setCrossing(true);

    const fromSide = playerSide;
    const toSide = fromSide === "left" ? "right" : "left";

    let newLeft = [...leftBank];
    let newRight = [...rightBank];

    // Remove item from source bank
    if (item) {
      if (fromSide === "left") {
        newLeft = newLeft.filter((i) => i !== item);
      } else {
        newRight = newRight.filter((i) => i !== item);
      }
    }

    // After a short delay (boat animation), complete the crossing
    setTimeout(() => {
      // Add item to destination bank
      if (item) {
        if (toSide === "left") {
          newLeft = [...newLeft, item];
        } else {
          newRight = [...newRight, item];
        }
      }

      // Check danger on the bank we're leaving
      const danger = checkDanger(newLeft, newRight, toSide);
      if (danger) {
        setFailMessage(danger);
        setIsFailed(true);
        setLeftBank(newLeft);
        setRightBank(newRight);
        setPlayerSide(toSide);
        setCrossing(false);

        toast({
          title: "Game Over! 💀",
          description: danger,
          variant: "destructive"
        });
        return;
      }

      setLeftBank(newLeft);
      setRightBank(newRight);
      setPlayerSide(toSide);
      setBoatItem(null);
      setMoveCount((prev) => prev + 1);
      setCrossing(false);

      toast({
        title: item
          ? `Crossed with ${ITEMS[item].label} ${ITEMS[item].emoji}`
          : "Crossed alone 🚣",
        description: `You are now on the ${toSide} bank.`,
        variant: "default"
      });
    }, 800);
  };

  const handleCommandSubmit = () => {
    pushCommand(inputValue);
    const cmd = inputValue.trim().toLowerCase();

    const crossWithMatch = cmd.match(
      /^\/cross\s+with\s+(wolf|goat|sheep|cabbage)$/i
    );
    const crossAloneMatch = cmd.match(/^\/cross\s+alone$/i);
    const resetMatch = cmd.match(/^\/reset$/i);
    const helpMatch = cmd.match(/^\/help$/i);

    if (isFailed && !resetMatch && !helpMatch) {
      toast({
        title: "Game Over",
        description: "Use /reset to try again.",
        variant: "destructive"
      });
      setInputValue("");
      return;
    }

    if (crossWithMatch) {
      let item = crossWithMatch[1].toLowerCase();
      // Accept "sheep" as alias for "goat" (internal key)
      if (item === "sheep") item = "goat";
      const currentBank = playerSide === "left" ? leftBank : rightBank;

      if (!currentBank.includes(item)) {
        toast({
          title: "Item Not Here",
          description: `The ${ITEMS[item].label} is not on the ${playerSide} bank.`,
          variant: "destructive"
        });
      } else {
        setBoatItem(item);
        performCrossing(item);
      }
    } else if (crossAloneMatch) {
      performCrossing(null);
    } else if (resetMatch) {
      setPlayerSide("left");
      setLeftBank(["wolf", "goat", "cabbage"]);
      setRightBank([]);
      setBoatItem(null);
      setIsSuccess(false);
      setIsFailed(false);
      setFailMessage("");
      setMoveCount(0);
      toast({
        title: "Level Reset",
        description: "Back to the left bank with all items.",
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

  // Render items on a bank using foreignObject for reliable emoji rendering
  const renderBankItems = (items, side) => {
    const count = items.length;
    return items.map((item, i) => {
      const bankCenter = side === "left" ? 50 : 345;
      const totalWidth = (count - 1) * 28;
      const xBase = bankCenter - totalWidth / 2;
      const x = xBase + i * 28;
      return (
        <motion.g
          key={`${side}-${item}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
        >
          <foreignObject x={x - 16} y={155} width={32} height={32}>
            <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: 24, textAlign: 'center', lineHeight: '32px', filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))' }}>
              {ITEMS[item].emoji}
            </div>
          </foreignObject>
        </motion.g>
      );
    });
  };

  const boatX = playerSide === "left" ? 120 : 230;

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
        className="mt-8 text-lg font-semibold mb-4 text-center text-purple-900 dark:text-[#F9DC34]"
      >
        Cross the river with all three items safely.
      </motion.p>

      {/* Scene */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-gradient-to-b from-[#87CEEB] via-[#B0D8F0] to-[#5BA3D9] dark:from-[#1a2744] dark:via-[#243654] dark:to-[#0f1d33] rounded-2xl p-0 shadow-2xl border-2 border-purple-200 dark:border-purple-700/40 w-full max-w-md relative overflow-hidden"
      >
        <svg viewBox="0 0 400 250" className="w-full">
          {/* Sun */}
          <defs>
            <radialGradient id="sunGradient">
              <stop offset="0%" stopColor="#FFE55C" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#F9DC34" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#F5A623" stopOpacity="0.2" />
            </radialGradient>
          </defs>
          <circle cx="350" cy="35" r="22" fill="url(#sunGradient)" />
          <circle cx="350" cy="35" r="16" fill="#FFE55C" />

          {/* Sky - gradient already in parent div */}
          <rect x="0" y="0" width="400" height="130" fill="transparent" />

          {/* Enhanced Clouds */}
          <g opacity="0.8" style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.1))' }}>
            <ellipse cx="80" cy="30" rx="28" ry="12" fill="white" />
            <ellipse cx="65" cy="26" rx="18" ry="10" fill="white" />
            <ellipse cx="95" cy="27" rx="16" ry="9" fill="white" />
          </g>
          <g opacity="0.6" style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.1))' }}>
            <ellipse cx="300" cy="45" rx="24" ry="10" fill="white" />
            <ellipse cx="285" cy="42" rx="16" ry="8" fill="white" />
            <ellipse cx="315" cy="43" rx="14" ry="7" fill="white" />
          </g>

          {/* River with gradient and depth */}
          <defs>
            <linearGradient id="riverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1976D2" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#2196F3" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0D47A1" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <rect x="100" y="130" width="200" height="120" fill="url(#riverGradient)" />

          {/* Left bank with texture */}
          <defs>
            <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6BA045" />
              <stop offset="100%" stopColor="#4A7A2E" />
            </linearGradient>
          </defs>
          <path
            d="M0,120 Q55,115 115,135 L115,250 L0,250 Z"
            fill="url(#grassGradient)"
            style={{ filter: 'drop-shadow(2px 0px 3px rgba(0,0,0,0.2))' }}
          />
          <path
            d="M0,128 Q55,123 112,140 L112,250 L0,250 Z"
            fill="#4A7A2E"
            opacity="0.7"
          />
          {/* Grass tufts on left bank */}
          <g opacity="0.6">
            <path d="M20,150 Q22,145 24,150" stroke="#2E5C1E" strokeWidth="1.5" fill="none" />
            <path d="M40,160 Q42,155 44,160" stroke="#2E5C1E" strokeWidth="1.5" fill="none" />
            <path d="M65,145 Q67,140 69,145" stroke="#2E5C1E" strokeWidth="1.5" fill="none" />
            <path d="M85,170 Q87,165 89,170" stroke="#2E5C1E" strokeWidth="1.5" fill="none" />
            <path d="M30,190 Q32,185 34,190" stroke="#2E5C1E" strokeWidth="1.5" fill="none" />
          </g>

          {/* Right bank with texture */}
          <path
            d="M285,135 Q345,115 400,120 L400,250 L285,250 Z"
            fill="url(#grassGradient)"
            style={{ filter: 'drop-shadow(-2px 0px 3px rgba(0,0,0,0.2))' }}
          />
          <path
            d="M288,140 Q345,123 400,128 L400,250 L288,250 Z"
            fill="#4A7A2E"
            opacity="0.7"
          />
          {/* Grass tufts on right bank */}
          <g opacity="0.6">
            <path d="M310,150 Q312,145 314,150" stroke="#2E5C1E" strokeWidth="1.5" fill="none" />
            <path d="M340,160 Q342,155 344,160" stroke="#2E5C1E" strokeWidth="1.5" fill="none" />
            <path d="M365,145 Q367,140 369,145" stroke="#2E5C1E" strokeWidth="1.5" fill="none" />
            <path d="M325,170 Q327,165 329,170" stroke="#2E5C1E" strokeWidth="1.5" fill="none" />
            <path d="M370,190 Q372,185 374,190" stroke="#2E5C1E" strokeWidth="1.5" fill="none" />
          </g>

          {/* Enhanced river waves */}
          <motion.path
            d="M115,160 Q145,153 175,160 Q205,167 235,160 Q265,153 285,160"
            fill="none"
            stroke="#90CAF9"
            strokeWidth="2.5"
            opacity="0.6"
            animate={{ x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />
          <motion.path
            d="M115,180 Q145,173 175,180 Q205,187 235,180 Q265,173 285,180"
            fill="none"
            stroke="#64B5F6"
            strokeWidth="2"
            opacity="0.5"
            animate={{ x: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          />
          <motion.path
            d="M115,200 Q145,193 175,200 Q205,207 235,200 Q265,193 285,200"
            fill="none"
            stroke="#90CAF9"
            strokeWidth="1.5"
            opacity="0.4"
            animate={{ x: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          />
          <motion.path
            d="M115,220 Q145,213 175,220 Q205,227 235,220 Q265,213 285,220"
            fill="none"
            stroke="#64B5F6"
            strokeWidth="1"
            opacity="0.3"
            animate={{ x: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          />

          {/* Bank labels - positioned above items */}
          <text x="55" y="148" textAnchor="middle" fontSize="11" fill="#F9DC34" fontWeight="bold" style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.4))' }}>
            ← LEFT
          </text>
          <text x="345" y="148" textAnchor="middle" fontSize="11" fill="#F9DC34" fontWeight="bold" style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.4))' }}>
            RIGHT →
          </text>

          {/* Boat with enhanced design */}
          <motion.g
            animate={{ x: crossing ? (playerSide === "left" ? 110 : -110) : 0 }}
            transition={{ type: "tween", duration: 0.8, ease: "easeInOut" }}
          >
            <motion.g
              animate={{ x: playerSide === "left" ? 0 : 110 }}
              transition={{ duration: 0 }}
            >
              {/* Boat shadow */}
              <ellipse
                cx="150"
                cy="239"
                rx="32"
                ry="8"
                fill="black"
                opacity="0.2"
              />
              {/* Boat body - darker wood */}
              <path
                d={`M${120},220 L${125},235 L${175},235 L${180},220 Z`}
                fill="#6D4C41"
                stroke="#4E342E"
                strokeWidth="2"
              />
              {/* Boat interior - lighter wood */}
              <path
                d={`M${125},220 L${128},232 L${172},232 L${175},220 Z`}
                fill="#8D6E63"
              />
              {/* Boat highlight */}
              <path
                d={`M${125},220 L${128},225 L${172},225 L${175},220 Z`}
                fill="#A1887F"
                opacity="0.5"
              />
              {/* Boat rim */}
              <line x1="125" y1="220" x2="175" y2="220" stroke="#4E342E" strokeWidth="2" />

              {/* Player in boat with shadow */}
              <text x="143" y="218" fontSize="24" className="select-none" style={{ filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))' }}>
                🧑
              </text>
              {/* Item in boat during crossing */}
              {crossing && boatItem && (
                <foreignObject x={152} y={200} width={24} height={24}>
                  <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: 18, textAlign: 'center', lineHeight: '24px', filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))' }}>
                    {ITEMS[boatItem].emoji}
                  </div>
                </foreignObject>
              )}
            </motion.g>
          </motion.g>

          {/* Items on banks with shadows */}
          <AnimatePresence>
            {renderBankItems(leftBank, "left")}
            {renderBankItems(rightBank, "right")}
          </AnimatePresence>

          {/* Failure overlay with better design */}
          {isFailed && (
            <g>
              <rect x="0" y="0" width="400" height="250" fill="rgba(200, 0, 0, 0.3)" />
              <rect x="80" y="50" width="240" height="110" rx="15" fill="rgba(139, 0, 0, 0.9)" />
              <rect x="85" y="55" width="230" height="100" rx="12" fill="rgba(220, 20, 60, 0.8)" />
              <text
                x="200"
                y="85"
                textAnchor="middle"
                fontSize="18"
                fill="#FFFFFF"
                fontWeight="bold"
                style={{ filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.5))' }}
              >
                GAME OVER! 💀
              </text>
              <text
                x="200"
                y="110"
                textAnchor="middle"
                fontSize="13"
                fill="#FFE5E5"
              >
                {failMessage}
              </text>
              <text
                x="200"
                y="135"
                textAnchor="middle"
                fontSize="11"
                fill="#F9DC34"
                fontWeight="bold"
              >
                Type /reset to try again
              </text>
            </g>
          )}


        </svg>
      </motion.div>



      {/* Help prompt */}
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
                    /cross with
                  </span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">
                    [wolf|goat|cabbage]
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Cross the river carrying the specified item.
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    /cross alone
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Cross the river without carrying anything.
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    /reset
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Reset the level to the beginning.
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    /help
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Show available commands and hints.
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 text-purple-800 dark:text-[#F9DC34]">
                Hint:
              </h3>
              <p className="text-gray-600 dark:text-gray-300 italic">
                A cycle of three, but only one can sail. A return journey may clear the path.
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

export default Level5;