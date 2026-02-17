"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

// Each light has 5 angular positions. The beam fans out from ceiling to floor.
// "hitsDoor" means the beam cone overlaps the door area.
// Starting positions: all 3 beams hit the door. Goal: rotate all away.
const LIGHT_DEFS = {
  A: {
    cx: 80,
    positions: [
      { floorX: 20, hitsDoor: false },
      { floorX: 75, hitsDoor: false },
      { floorX: 145, hitsDoor: false },
      { floorX: 195, hitsDoor: true },   // ← START
      { floorX: 290, hitsDoor: false },
    ],
    startIdx: 3,
    color: "#FBBF24"
  },
  B: {
    cx: 190,
    positions: [
      { floorX: 80, hitsDoor: false },
      { floorX: 135, hitsDoor: false },
      { floorX: 190, hitsDoor: true },   // ← START
      { floorX: 250, hitsDoor: false },
      { floorX: 310, hitsDoor: false },
    ],
    startIdx: 2,
    color: "#FCD34D"
  },
  C: {
    cx: 300,
    positions: [
      { floorX: 90, hitsDoor: false },
      { floorX: 185, hitsDoor: true },   // ← START
      { floorX: 255, hitsDoor: false },
      { floorX: 310, hitsDoor: false },
      { floorX: 365, hitsDoor: false },
    ],
    startIdx: 1,
    color: "#FDE68A"
  }
};

const LIGHT_Y = 35;
const FLOOR_Y = 220;
const BEAM_HALF_W = 25;
const DOOR_X = 165;
const DOOR_W = 50;
const DOOR_H = 70;
const DOOR_Y = FLOOR_Y - DOOR_H;

const Level1 = ({ levelNumber = 1, onComplete, nextLevelNumber = 2 }) => {
  const [inputValue, setInputValue] = useState("");
  const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lightPositions, setLightPositions] = useState({
    A: LIGHT_DEFS.A.startIdx,
    B: LIGHT_DEFS.B.startIdx,
    C: LIGHT_DEFS.C.startIdx
  });
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Check win: no beam hits the door
  const anyHitsDoor = () => {
    return (
      LIGHT_DEFS.A.positions[lightPositions.A].hitsDoor ||
      LIGHT_DEFS.B.positions[lightPositions.B].hitsDoor ||
      LIGHT_DEFS.C.positions[lightPositions.C].hitsDoor
    );
  };

  useEffect(() => {
    if (!anyHitsDoor() && !isSuccess) {
      setIsSuccess(true);
    }
  }, [lightPositions]);

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Door Unlocked! 🚪✨",
        description: "The overlapping shadows cancelled the light. The door opens!",
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

    const rotateMatch = cmd.match(/^\/rotate\s+(lighta|lightb|lightc)\s+(left|right)$/i);
    const resetMatch = cmd.match(/^\/reset$/i);
    const helpMatch = cmd.match(/^\/help$/i);

    if (rotateMatch) {
      const lightKey = rotateMatch[1].charAt(rotateMatch[1].length - 1).toUpperCase();
      const dir = rotateMatch[2].toLowerCase();
      const def = LIGHT_DEFS[lightKey];
      const current = lightPositions[lightKey];

      if (dir === "left" && current > 0) {
        setLightPositions((p) => ({ ...p, [lightKey]: current - 1 }));
        toast({
          title: `Light ${lightKey} rotated left`,
          description: `Position: ${current - 1 + 1}/5`,
          variant: "default"
        });
      } else if (dir === "right" && current < def.positions.length - 1) {
        setLightPositions((p) => ({ ...p, [lightKey]: current + 1 }));
        toast({
          title: `Light ${lightKey} rotated right`,
          description: `Position: ${current + 1 + 1}/5`,
          variant: "default"
        });
      } else {
        toast({
          title: "Can't rotate further",
          description: `Light ${lightKey} is already at the ${dir === "left" ? "leftmost" : "rightmost"} position.`,
          variant: "destructive"
        });
      }
    } else if (resetMatch) {
      setLightPositions({
        A: LIGHT_DEFS.A.startIdx,
        B: LIGHT_DEFS.B.startIdx,
        C: LIGHT_DEFS.C.startIdx
      });
      setIsSuccess(false);
      toast({
        title: "Level Reset",
        description: "Lights returned to starting positions.",
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

  // Render a single light beam
  const renderBeam = (lightKey) => {
    const def = LIGHT_DEFS[lightKey];
    const posIdx = lightPositions[lightKey];
    const pos = def.positions[posIdx];
    const floorX = pos.floorX;

    return (
      <motion.g
        key={lightKey}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Beam cone */}
        <motion.polygon
          animate={{
            points: `${def.cx},${LIGHT_Y + 10} ${floorX - BEAM_HALF_W},${FLOOR_Y} ${floorX + BEAM_HALF_W},${FLOOR_Y}`
          }}
          transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
          fill={def.color}
          opacity={pos.hitsDoor ? "0.25" : "0.15"}
        />
        {/* Beam center line */}
        <motion.line
          animate={{
            x1: def.cx,
            y1: LIGHT_Y + 10,
            x2: floorX,
            y2: FLOOR_Y
          }}
          transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
          stroke={def.color}
          strokeWidth="1"
          opacity="0.3"
        />
      </motion.g>
    );
  };

  // Render light fixture
  const renderFixture = (lightKey) => {
    const def = LIGHT_DEFS[lightKey];
    const posIdx = lightPositions[lightKey];
    const hits = def.positions[posIdx].hitsDoor;

    return (
      <g key={`fix-${lightKey}`}>
        {/* Wire */}
        <line x1={def.cx} y1={10} x2={def.cx} y2={LIGHT_Y - 5} stroke="#666" strokeWidth="1.5" />
        {/* Bulb housing */}
        <rect x={def.cx - 12} y={LIGHT_Y - 5} width={24} height={10} rx="3" fill="#444" stroke="#555" strokeWidth="1" />
        {/* Bulb */}
        <circle cx={def.cx} cy={LIGHT_Y + 10} r="6" fill={hits ? def.color : "#887722"} opacity={hits ? 1 : 0.5} />
        {/* Glow */}
        {hits && (
          <circle cx={def.cx} cy={LIGHT_Y + 10} r="12" fill={def.color} opacity="0.15" />
        )}
        {/* Label */}
        <text x={def.cx} y={LIGHT_Y - 12} textAnchor="middle" fontSize="10" fill={hits ? "#FF6B6B" : "#4ADE80"} fontWeight="bold">
          {lightKey}
        </text>
      </g>
    );
  };

  const doorHit = anyHitsDoor();

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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
        className="mt-8 text-lg font-semibold mb-4 text-center text-purple-900 dark:text-[#F9DC34]"
      >
        Unlock the door.
      </motion.p>

      {/* Scene */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.7, delay: 0.3, type: "spring", stiffness: 80 }}
        className="bg-[#0a0a1a] dark:bg-[#0a0a1a] rounded-2xl p-4 shadow-lg border border-purple-700/30 w-full max-w-md relative overflow-hidden"
      >
        <svg viewBox="0 0 380 260" className="w-full">
          {/* Room background */}
          <rect x="0" y="0" width="380" height="260" fill="#0a0a1a" />

          {/* Ceiling */}
          <rect x="0" y="0" width="380" height="12" fill="#1a1a2e" />
          <line x1="0" y1="12" x2="380" y2="12" stroke="#333" strokeWidth="1" />

          {/* Floor */}
          <rect x="0" y={FLOOR_Y} width="380" height={260 - FLOOR_Y} fill="#111122" />
          <line x1="0" y1={FLOOR_Y} x2="380" y2={FLOOR_Y} stroke="#333" strokeWidth="1" />

          {/* Wall pattern */}
          {[...Array(8)].map((_, i) => (
            <line key={`w${i}`} x1={0} y1={30 + i * 25} x2={380} y2={30 + i * 25} stroke="#141428" strokeWidth="0.5" />
          ))}

          {/* Light beams (behind door) */}
          {["A", "B", "C"].map(renderBeam)}

          {/* Door */}
          <rect
            x={DOOR_X}
            y={DOOR_Y}
            width={DOOR_W}
            height={DOOR_H}
            rx="3"
            fill={isSuccess ? "#1a3a1a" : "#1a1a2e"}
            stroke={isSuccess ? "#22c55e" : doorHit ? "#FF6B6B" : "#22c55e"}
            strokeWidth="2"
          />
          {/* Door panels */}
          <rect x={DOOR_X + 5} y={DOOR_Y + 5} width={DOOR_W - 10} height={28} rx="2" fill="none" stroke={isSuccess ? "#22c55e44" : "#ffffff10"} strokeWidth="1" />
          <rect x={DOOR_X + 5} y={DOOR_Y + 37} width={DOOR_W - 10} height={28} rx="2" fill="none" stroke={isSuccess ? "#22c55e44" : "#ffffff10"} strokeWidth="1" />
          {/* Door handle */}
          <circle
            cx={DOOR_X + DOOR_W - 10}
            cy={DOOR_Y + DOOR_H / 2}
            r="3"
            fill={isSuccess ? "#22c55e" : "#F9DC34"}
          />

          {/* Light fixtures (on top of beams) */}
          {["A", "B", "C"].map(renderFixture)}



          {/* Title */}

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
                    /rotate
                  </span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">
                    [lightA/lightB/lightC] [left/right]
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Rotate a light's beam direction left or right.
                    <br />
                    e.g., <code>/rotate lightA left</code>
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    /reset
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Reset all lights to starting positions.
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
                Shadows tell no tales, but the light must look elsewhere.
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

export default Level1;
