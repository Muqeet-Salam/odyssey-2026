"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";

// The COSC logo is a 2×2 layout:
// Top-Left: C (deep purple)   | Top-Right: O (purple)
// Bottom-Left: S (magenta)     | Bottom-Right: C (pink)
const TILES = [
  { id: 0, letter: "C", gradient: ["#594D9F", "#714C9C"], label: "C (deep purple)" },
  { id: 1, letter: "O", gradient: ["#714C9C", "#C22C89"], label: "O (purple)" },
  { id: 2, letter: "S", gradient: ["#714C9C", "#C22C89"], label: "S (magenta)" },
  { id: 3, letter: "C", gradient: ["#C22C89", "#D72087"], label: "C (pink)" },
];

// Solved order: [0, 1, 2, 3]
const SOLVED = [0, 1, 2, 3];

const createInitialGrid = () => {
  let grid;
  do {
    grid = [...SOLVED];
    // Fisher-Yates shuffle
    for (let i = grid.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [grid[i], grid[j]] = [grid[j], grid[i]];
    }
  } while (grid.every((id, i) => id === SOLVED[i]));
  return grid;
};

const Level1 = ({ onComplete }) => {
  const [inputValue, setInputValue] = useState("");
  const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [grid, setGrid] = useState(() => createInitialGrid());
  const [moveCount, setMoveCount] = useState(0);
  const { toast } = useToast();

  // Check win
  useEffect(() => {
    if (grid.every((id, i) => id === SOLVED[i]) && !isSuccess) {
      setIsSuccess(true);
    }
  }, [grid, isSuccess]);

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "COSC Logo Restored!",
        description: `Puzzle solved in ${moveCount} swaps!`,
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

  // Position names for the 2×2 grid
  const POS_MAP = {
    "top-left": 0, "tl": 0, "1": 0,
    "top-right": 1, "tr": 1, "2": 1,
    "bottom-left": 2, "bl": 2, "3": 2,
    "bottom-right": 3, "br": 3, "4": 3};

  const POS_LABELS = ["Top-Left", "Top-Right", "Bottom-Left", "Bottom-Right"];

  const parsePos = (str) => {
    const cleaned = str.trim().toLowerCase();
    if (cleaned in POS_MAP) return POS_MAP[cleaned];
    return null;
  };

  const handleCommandSubmit = () => {
    pushCommand(inputValue);
    const cmd = inputValue.trim().toLowerCase();

    const swapMatch = cmd.match(/^\/swap\s+(\S+)\s+(\S+)$/i);
    const resetMatch = cmd.match(/^\/reset$/i);
    const helpMatch = cmd.match(/^\/help$/i);

    if (swapMatch) {
      const pos1 = parsePos(swapMatch[1]);
      const pos2 = parsePos(swapMatch[2]);

      if (pos1 === null || pos2 === null) {
        toast({
          title: "Invalid Position",
          description: "Use: TL (Top-Left), TR (Top-Right), BL (Bottom-Left), BR (Bottom-Right), or 1-4.",
          variant: "destructive"
      });
      } else if (pos1 === pos2) {
        toast({
          title: "Same Position",
          description: "Pick two different tiles to swap.",
          variant: "destructive"
      });
      } else {
        const newGrid = [...grid];
        [newGrid[pos1], newGrid[pos2]] = [newGrid[pos2], newGrid[pos1]];
        setGrid(newGrid);
        setMoveCount((p) => p + 1);

        toast({
          title: `Swapped ${POS_LABELS[pos1]} ↔ ${POS_LABELS[pos2]}`,
          description: `Moves: ${moveCount + 1}`,
          variant: "default"
      });
      }
    } else if (resetMatch) {
      setGrid(createInitialGrid());
      setMoveCount(0);
      setIsSuccess(false);
      toast({
        title: "Level Reset",
        description: "Tiles scrambled again.",
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

  const TILE_SIZE = 140;
  const GAP = 8;
  const PADDING = 20;
  const GRID_W = TILE_SIZE * 2 + GAP + PADDING * 2;

  const renderTile = (gridIndex) => {
    const tileId = grid[gridIndex];
    const tile = TILES[tileId];
    const row = Math.floor(gridIndex / 2);
    const col = gridIndex % 2;
    const x = PADDING + col * (TILE_SIZE + GAP);
    const y = PADDING + 25 + row * (TILE_SIZE + GAP);
    const isCorrect = tileId === gridIndex;
    const gradId = `grad-${gridIndex}`;

    return (
      <motion.g
        key={`tile-${gridIndex}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: gridIndex * 0.1 }}
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={tile.gradient[0]} />
            <stop offset="100%" stopColor={tile.gradient[1]} />
          </linearGradient>
        </defs>

        {/* Tile background */}
        <rect
          x={x}
          y={y}
          width={TILE_SIZE}
          height={TILE_SIZE}
          rx="16"
          fill={`url(#${gradId})`}
          stroke={isCorrect ? "#22c55e" : "#ffffff15"}
          strokeWidth={isCorrect ? "3" : "1"}
        />

        {/* Letter */}
        <text
          x={x + TILE_SIZE / 2}
          y={y + TILE_SIZE / 2 + 28}
          textAnchor="middle"
          fontSize="80"
          fill="white"
          fontWeight="bold"
          fontFamily="'Arial Rounded MT Bold', Arial, sans-serif"
          opacity="0.95"
        >
          {tile.letter}
        </text>

        {/* Position label */}
        <text
          x={x + 12}
          y={y + 18}
          fontSize="10"
          fill="rgba(255,255,255,0.4)"
          fontFamily="monospace"
        >
          {POS_LABELS[gridIndex]}
        </text>

        {/* Correct indicator */}
        {isCorrect && (
          <g>
            <circle cx={x + TILE_SIZE - 16} cy={y + 16} r="8" fill="#22c55e" opacity="0.9" />
            <text
              x={x + TILE_SIZE - 16}
              y={y + 20}
              textAnchor="middle"
              fontSize="10"
              fill="white"
            >
              ✓
            </text>
          </g>
        )}
      </motion.g>
    );
  };

  return (
    <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">
      {/* Level title badge - now in sticky header */}

      {/* Question */}
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
        className="mt-8 text-lg font-semibold mb-4 text-center text-gray-900 dark:text-[#F9DC34]"
      >
        The COSC Scramble — Restore the logo.
      </motion.p>

      {/* Reference logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mb-3 flex items-center gap-3"
      >
        <Image src="/LogoCOSC.svg" alt="COSC Logo" width={48} height={48} className="rounded-lg shadow-md" />
        <span className="text-xs text-gray-400 dark:text-gray-300 italic">Target logo</span>
      </motion.div>

      {/* Puzzle grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.7, delay: 0.3, type: "spring", stiffness: 80 }}
        className="bg-[#0a0a1a] dark:bg-[#0a0a1a] rounded-2xl p-2 shadow-lg border border-gray-700/30 w-full max-w-sm relative overflow-hidden"
      >
        <svg viewBox={`0 0 ${GRID_W} ${GRID_W + 15}`} className="w-full">
          {/* Title */}
          <text
            x={GRID_W / 2}
            y={18}
            textAnchor="middle"
            fontSize="11"
            fill="#8888BB"
            fontWeight="bold"
          >
            REARRANGE TO FORM THE COSC LOGO
          </text>

          {/* Tiles */}
          {[0, 1, 2, 3].map((i) => renderTile(i))}

          {/* Move counter */}
          <text
            x={GRID_W / 2}
            y={GRID_W + 14}
            textAnchor="middle"
            fontSize="11"
            fill="#8888BB"
          >
            Swaps: {moveCount} | ✅ {grid.filter((id, i) => id === i).length}/4
          </text>
        </svg>
      </motion.div>

      {/* Gradient hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full max-w-sm mt-3 flex items-center justify-center"
      >
        <div className="h-4 w-48 rounded-full overflow-hidden flex">
          <div className="flex-1" style={{ background: "#594D9F" }} />
          <div className="flex-1" style={{ background: "#714C9C" }} />
          <div className="flex-1" style={{ background: "#C22C89" }} />
          <div className="flex-1" style={{ background: "#D72087" }} />
        </div>
        <span className="text-xs text-gray-400 ml-2">Purple → Pink</span>
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
                    /swap
                  </span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">[pos1] [pos2]</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Swap two tiles. Positions:
                    <br />
                    <code>TL</code> = Top-Left, <code>TR</code> = Top-Right
                    <br />
                    <code>BL</code> = Bottom-Left, <code>BR</code> = Bottom-Right
                    <br />
                    Or use numbers: <code>1</code>=TL, <code>2</code>=TR, <code>3</code>=BL, <code>4</code>=BR
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    /reset
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Scramble the tiles again.
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
                Goal:
              </h3>
              <div className="mb-4 text-gray-600 dark:text-gray-300 text-sm">
                <p className="mb-2">Arrange the 4 tiles to match the COSC logo:</p>
                <div className="grid grid-cols-2 gap-1 w-40 mx-auto my-2">
                  <div className="text-center py-3 rounded-lg font-bold text-white text-xl" style={{ background: "#594D9F" }}>C</div>
                  <div className="text-center py-3 rounded-lg font-bold text-white text-xl" style={{ background: "#714C9C" }}>O</div>
                  <div className="text-center py-3 rounded-lg font-bold text-white text-xl" style={{ background: "#C22C89" }}>S</div>
                  <div className="text-center py-3 rounded-lg font-bold text-white text-xl" style={{ background: "#D72087" }}>C</div>
                </div>
                <p>• ✅ Green check = tile is in the correct position</p>
              </div>

              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-[#F9DC34]">
                Hint:
              </h3>
              <p className="text-gray-600 dark:text-gray-300 italic">
                Use the color gradient to sort. Deep Purple belongs at the top (C, O); Bright Pink belongs at the bottom (S, C).
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

export default Level1;