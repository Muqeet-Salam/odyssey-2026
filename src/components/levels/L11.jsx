"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { useTheme } from "next-themes";

// 4x4 board with missing bottom corners
const BOARD_WIDTH = 4;
const BOARD_HEIGHT = 4;
const LETTERS = ["A", "B", "C", "D"];
const MISSING_SQUARES = new Set([
  `0,${BOARD_HEIGHT - 1}`,
  `${BOARD_WIDTH - 1},${BOARD_HEIGHT - 1}`,
]);
const DEFAULT_START = null;

// Knight L-shaped moves
const KNIGHT_DELTAS = [
  { dx: 2, dy: 1 },
  { dx: 2, dy: -1 },
  { dx: -2, dy: 1 },
  { dx: -2, dy: -1 },
  { dx: 1, dy: 2 },
  { dx: 1, dy: -2 },
  { dx: -1, dy: 2 },
  { dx: -1, dy: -2 },
];

const isPlayableSquare = (x, y) =>
  x >= 0 &&
  x < BOARD_WIDTH &&
  y >= 0 &&
  y < BOARD_HEIGHT &&
  !MISSING_SQUARES.has(`${x},${y}`);

const isValidKnightMove = (from, to) =>
  KNIGHT_DELTAS.some((d) => from.x + d.dx === to.x && from.y + d.dy === to.y);

// Parse chess notation e.g. "A1" -> { x:0, y:3 }
const parseNotation = (str) => {
  const s = str.trim().toUpperCase();
  if (s.length < 2) return null;
  const col = LETTERS.indexOf(s[0]);
  const row = parseInt(s.slice(1));
  if (col < 0 || isNaN(row) || row < 1 || row > BOARD_HEIGHT) return null;
  return { x: col, y: BOARD_HEIGHT - row };
};

const toNotation = (x, y) => `${LETTERS[x]}${BOARD_HEIGHT - y}`;

const PLAYABLE_SQUARES = Array.from({ length: BOARD_WIDTH * BOARD_HEIGHT }, (_, i) => {
  const x = i % BOARD_WIDTH;
  const y = Math.floor(i / BOARD_WIDTH);
  return { x, y };
}).filter((p) => isPlayableSquare(p.x, p.y));

// Generate a random starting position
const isSameSquare = (a, b) => a.x === b.x && a.y === b.y;

const Level11 = ({ levelNumber, onComplete, nextLevelNumber }) => {
  const [inputValue, setInputValue] = useState("");
  const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const initialized = useRef(false);
  const [startPos, setStartPos] = useState(DEFAULT_START);
  const [knightPos, setKnightPos] = useState(DEFAULT_START);
  const [visited, setVisited] = useState(new Set());
  const [moveHistory, setMoveHistory] = useState([]);
  const [moveCount, setMoveCount] = useState(0);
  const [isStuck, setIsStuck] = useState(false);
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const totalSquares = PLAYABLE_SQUARES.length;

  // Initialize with random start on first mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setStartPos(DEFAULT_START);
      setKnightPos(DEFAULT_START);
      setVisited(new Set());
      setMoveHistory([]);
      setMessage(
        "The bridge is empty. Choose where the knight begins with /start (e.g., /start A4)."
      );
    }
  }, []);

  const visitedCount = visited.size;

  const hasStart = !!startPos;
  const isBackAtStart = hasStart && isSameSquare(knightPos, startPos);

  // Check win: all playable squares visited and return to start (closed tour)
  useEffect(() => {
    if (hasStart && visitedCount === totalSquares && isBackAtStart && !isSuccess) {
      setIsSuccess(true);
      setMessage(
        String.fromCodePoint(0x1f389) +
        " Closed tour complete! The knight returned to the start."
      );
    }
  }, [visitedCount, totalSquares, isBackAtStart, isSuccess, hasStart]);

  useEffect(() => {
    if (hasStart && visitedCount === totalSquares && !isBackAtStart && !isSuccess) {
      setMessage(
        `All squares visited! Return to ${toNotation(startPos.x, startPos.y)} to finish.`
      );
    }
  }, [visitedCount, totalSquares, isBackAtStart, isSuccess, startPos, hasStart]);

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Knight's Tour Complete! " + String.fromCodePoint(0x265e),
        description: `Closed tour finished in ${moveCount} moves!`,
        variant: "success",        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",      });
      setTimeout(() => onComplete(nextLevelNumber), 2000);
    }
  }, [isSuccess, onComplete, toast, moveCount]);

  // Check stuck (no valid moves remaining)
  useEffect(() => {
    if (!hasStart || isSuccess || moveCount === 0) return;

    if (visitedCount < totalSquares) {
      const hasMove = KNIGHT_DELTAS.some((d) => {
        const nx = knightPos.x + d.dx;
        const ny = knightPos.y + d.dy;
        return isPlayableSquare(nx, ny) && !visited.has(`${nx},${ny}`);
      });
      if (!hasMove) {
        setIsStuck(true);
        setMessage(
          `No valid moves left! ${visitedCount}/${totalSquares} visited. Use /undo or /reset.`
        );
      } else {
        setIsStuck(false);
      }
      return;
    }

    if (!isBackAtStart) {
      const canReturn = KNIGHT_DELTAS.some((d) => {
        const nx = knightPos.x + d.dx;
        const ny = knightPos.y + d.dy;
        return nx === startPos.x && ny === startPos.y;
      });
      if (!canReturn) {
        setIsStuck(true);
        setMessage(
          `All squares visited, but no path back to ${toNotation(startPos.x, startPos.y)}. Use /undo or /reset.`
        );
      } else {
        setIsStuck(false);
      }
    }
  }, [
    knightPos,
    visited,
    visitedCount,
    totalSquares,
    isSuccess,
    moveCount,
    isBackAtStart,
    startPos,
  ]);

  // Valid moves for current position
  const getValidMoves = useCallback(() => {
    if (!hasStart) return [];
    return KNIGHT_DELTAS.map((d) => ({
      x: knightPos.x + d.dx,
      y: knightPos.y + d.dy,
    }))
      .filter((m) => isPlayableSquare(m.x, m.y))
      .filter((m) => {
        const key = `${m.x},${m.y}`;
        if (!visited.has(key)) return true;
        const isStartSquare = m.x === startPos.x && m.y === startPos.y;
        return isStartSquare && visited.size === totalSquares && !isBackAtStart;
      });
  }, [knightPos, visited, startPos, totalSquares, isBackAtStart, hasStart]);

  const validMoves = getValidMoves();

  const handleCommandSubmit = () => {
    pushCommand(inputValue);
    const cmd = inputValue.trim().toLowerCase();
    const themeMatch = cmd.match(/^\/theme\s+(dark|light)$/i);
    const startMatch = cmd.match(/^\/start\s+([a-d][1-4])$/i);
    const moveMatch = cmd.match(/^\/move\s+([a-d][1-4])$/i);
    const undoMatch = cmd.match(/^\/undo$/i);
    const resetMatch = cmd.match(/^\/reset$/i);
    const helpMatch = cmd.match(/^\/help$/i);

    if (themeMatch) {
      setTheme(themeMatch[1].toLowerCase());
      toast({
        title: themeMatch[1].toLowerCase() === "dark" ? "🌙 Theme Changed" : "☀️ Theme Changed",
        description: `Switched to ${themeMatch[1].toLowerCase()} mode`,
        variant: "default"
      });
    } else if (startMatch) {
      const target = parseNotation(startMatch[1]);
      if (!target) {
        toast({
          title: "Invalid Square",
          description: "Use A1-D4 (note: A1 and D1 are missing).",
          variant: "destructive",
        });
      } else if (!isPlayableSquare(target.x, target.y)) {
        toast({
          title: "Missing Square",
          description: `${startMatch[1].toUpperCase()} is not part of the board.`,
          variant: "destructive",
        });
      } else {
        setStartPos(target);
        setKnightPos(target);
        setVisited(new Set([`${target.x},${target.y}`]));
        setMoveHistory([{ ...target }]);
        setMoveCount(0);
        setIsSuccess(false);
        setIsStuck(false);
        setMessage(
          `Start set to ${toNotation(target.x, target.y)}. Cross the bridge by stepping on each stone once, then return to the start.`
        );
        toast({
          title: "Start Set",
          description: `Knight placed at ${toNotation(target.x, target.y)}.`,
          variant: "default",
        });
      }
    } else if (moveMatch) {
      if (!hasStart) {
        toast({
          title: "Place the Knight",
          description: "Choose a starting square with /start first.",
          variant: "destructive",
        });
        setInputValue("");
        return;
      }
      const target = parseNotation(moveMatch[1]);
      if (!target) {
        toast({
          title: "Invalid Square",
          description: "Use A1-D4 (note: A1 and D1 are missing).",
          variant: "destructive",
        });
      } else if (!isPlayableSquare(target.x, target.y)) {
        toast({
          title: "Missing Square",
          description: `${moveMatch[1].toUpperCase()} is not part of the board.`,
          variant: "destructive",
        });
      } else if (!isValidKnightMove(knightPos, target)) {
        toast({
          title: "Invalid Move",
          description: `The knight can\u2019t reach ${toNotation(target.x, target.y)} from ${toNotation(knightPos.x, knightPos.y)}. Move in an L-shape!`,
          variant: "destructive",
        });
      } else if (
        visited.has(`${target.x},${target.y}`) &&
        !(isSameSquare(target, startPos) && visitedCount === totalSquares)
      ) {
        toast({
          title: "Square Already Visited",
          description: `${toNotation(target.x, target.y)} has already vanished!`,
          variant: "destructive",
        });
      } else {
        const newVisited = new Set(visited);
        const isReturnToStart = isSameSquare(target, startPos);
        if (!isReturnToStart) {
          newVisited.add(`${target.x},${target.y}`);
        }
        const newCount = moveCount + 1;
        setKnightPos(target);
        setVisited(newVisited);
        setMoveCount(newCount);
        setMoveHistory((prev) => [...prev, target]);
        setIsStuck(false);
        const remaining = totalSquares - newVisited.size;
        if (remaining > 0) {
          setMessage(
            `Moved to ${toNotation(target.x, target.y)}. ${remaining} square${remaining !== 1 ? "s" : ""} remaining.`
          );
        } else if (!isReturnToStart) {
          setMessage(
            `All squares visited! Return to ${toNotation(startPos.x, startPos.y)} to finish.`
          );
        }
      }
    } else if (undoMatch) {
      if (moveHistory.length > 1) {
        const newHistory = moveHistory.slice(0, -1);
        const prevPos = newHistory[newHistory.length - 1];
        const lastPos = moveHistory[moveHistory.length - 1];
        const newVisited = new Set(visited);
        // Don't un-visit the start position
        if (!(lastPos.x === startPos.x && lastPos.y === startPos.y)) {
          newVisited.delete(`${lastPos.x},${lastPos.y}`);
        }
        setMoveHistory(newHistory);
        setKnightPos(prevPos);
        setMoveCount(moveCount - 1);
        setVisited(newVisited);
        setIsStuck(false);
        setMessage(`Undone. Back to ${toNotation(prevPos.x, prevPos.y)}.`);
      } else {
        toast({
          title: "Nothing to Undo",
          description: "You\u2019re at the starting position.",
          variant: "default",
        });
      }
    } else if (resetMatch) {
      if (!hasStart) {
        setMessage("Choose a starting square with /start to begin the crossing.");
        toast({
          title: "No Start Set",
          description: "Use /start to place the knight.",
          variant: "destructive",
        });
        setInputValue("");
        return;
      }
      setKnightPos({ ...startPos });
      setMoveHistory([{ ...startPos }]);
      setVisited(new Set([`${startPos.x},${startPos.y}`]));
      setMoveCount(0);
      setIsSuccess(false);
      setIsStuck(false);
      setMessage(
        `Restarted at ${toNotation(startPos.x, startPos.y)}. Cross the bridge by stepping on each stone once, then return to the start.`
      );
      toast({
        title: "Level Reset",
        description: `Knight placed at ${toNotation(startPos.x, startPos.y)}. Try again!`,
        variant: "default",
      });
    } else if (helpMatch) {
      setHelpModalOpen(true);
    } else {
      toast({
        title: "Unknown Command",
        description: "Type /help to see available commands.",
        variant: "destructive",
      });
    }
    setInputValue("");
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") handleCommandSubmit();
  };

  const CELL = 64;
  const LABEL = 22;
  const SVG_W = BOARD_WIDTH * CELL + LABEL;
  const SVG_H = BOARD_HEIGHT * CELL + LABEL;

  return (
    <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">

      {/* Board */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-[#1a1a2e] rounded-2xl p-3 shadow-lg border border-gray-700/30 w-full max-w-[380px] relative"
      >
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
          {/* Column labels */}
          {LETTERS.map((letter, i) => (
            <text
              key={`col-${i}`}
              x={LABEL + i * CELL + CELL / 2}
              y={SVG_H - 4}
              textAnchor="middle"
              fontSize="12"
              fill="#8888BB"
              fontWeight="bold"
            >
              {letter}
            </text>
          ))}

          {/* Row labels */}
          {Array.from({ length: BOARD_HEIGHT }, (_, i) => (
            <text
              key={`row-${i}`}
              x={9}
              y={i * CELL + CELL / 2 + 5}
              textAnchor="middle"
              fontSize="12"
              fill="#8888BB"
              fontWeight="bold"
            >
              {BOARD_HEIGHT - i}
            </text>
          ))}

          {/* Grid cells */}
          {Array.from({ length: BOARD_HEIGHT }, (_, row) =>
            Array.from({ length: BOARD_WIDTH }, (_, col) => {
              if (!isPlayableSquare(col, row)) return null;
              const key = `${col},${row}`;
              const isKnight =
                hasStart && col === knightPos.x && row === knightPos.y;
              const isStart =
                hasStart && col === startPos.x && row === startPos.y;
              const isVisited = visited.has(key) && !isKnight && !isStart;
              const isValid = validMoves.some(
                (m) => m.x === col && m.y === row
              );
              const isDark = (row + col) % 2 === 1;

              const cellX = LABEL + col * CELL;
              const cellY = row * CELL;
              const cx = cellX + CELL / 2;
              const cy = cellY + CELL / 2;

              // Determine fill
              let fillColor;
              if (isKnight) {
                fillColor = "#7C3AED";
              } else if (isStart && !isKnight) {
                fillColor = "#2E7D32";
              } else if (isVisited) {
                fillColor = "#0a0a15";
              } else if (isValid) {
                fillColor = isDark ? "#3a2060" : "#4a2878";
              } else {
                fillColor = isDark ? "#2D1B4B" : "#3D2060";
              }

              return (
                <g key={key}>
                  <motion.rect
                    x={cellX}
                    y={cellY}
                    width={CELL}
                    height={CELL}
                    fill={fillColor}
                    stroke={isVisited ? "#0a0a15" : "#6B21A8"}
                    strokeWidth={isVisited ? "0.5" : "0.8"}
                    rx="2"
                    animate={{
                      fill: fillColor,
                      opacity: isVisited ? 0.3 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Green castle marker (start) — only when knight is NOT on it */}
                  {isStart && !isKnight && (
                    <g>
                      <rect
                        x={cx - 12}
                        y={cy - 12}
                        width={5}
                        height={7}
                        fill="#66BB6A"
                        rx="1"
                      />
                      <rect
                        x={cx - 2}
                        y={cy - 14}
                        width={5}
                        height={9}
                        fill="#66BB6A"
                        rx="1"
                      />
                      <rect
                        x={cx + 7}
                        y={cy - 12}
                        width={5}
                        height={7}
                        fill="#66BB6A"
                        rx="1"
                      />
                      <rect
                        x={cx - 12}
                        y={cy - 5}
                        width={24}
                        height={16}
                        fill="#4CAF50"
                        rx="2"
                      />
                      <rect
                        x={cx - 3}
                        y={cy + 2}
                        width={7}
                        height={9}
                        fill="#2E7D32"
                        rx="1"
                      />
                      <text
                        x={cx}
                        y={cy + 22}
                        textAnchor="middle"
                        fontSize="7"
                        fill="#81C784"
                        fontWeight="bold"
                      >
                        START
                      </text>
                    </g>
                  )}

                  {/* Valid move indicator (pulsing yellow dot) */}
                  {isValid && !isKnight && (
                    <motion.circle
                      cx={cx}
                      cy={cy}
                      r="8"
                      fill="#F9DC34"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0.3, 0.7, 0.3],
                        scale: 1,
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}

                  {/* Vanished square mark */}
                  {isVisited && (
                    <motion.text
                      x={cx}
                      y={cy + 4}
                      textAnchor="middle"
                      fontSize="14"
                      fill="#333"
                      fontWeight="bold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                    >
                      {String.fromCodePoint(0x2716)}
                    </motion.text>
                  )}
                </g>
              );
            })
          )}

          {/* Knight piece */}
          {hasStart && (
            <AnimatePresence mode="popLayout">
              <motion.text
                key={`knight-${knightPos.x}-${knightPos.y}`}
                x={LABEL + knightPos.x * CELL + CELL / 2}
                y={knightPos.y * CELL + CELL / 2 + 12}
                textAnchor="middle"
                fontSize="36"
                className="select-none"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {String.fromCodePoint(0x265e)}
              </motion.text>
            </AnimatePresence>
          )}
        </svg>


      </motion.div>

      {/* Sticky Command Panel */}
      <div className="sticky bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-purple-50/95 via-purple-50/90 to-transparent dark:from-[#1A0F2E] dark:via-[#1A0F2E]/95 dark:to-transparent backdrop-blur-sm border-t border-purple-300/30 dark:border-purple-500/20 py-4 mt-8">
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
            className="bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden shadow-2xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
          >
            <div className="p-6 overflow-y-auto flex-grow">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-[#F9DC34]">
                The Lonely Knight {String.fromCodePoint(0x265e)}
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
                    /start
                  </span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">
                    [square]
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Choose the starting square (e.g.,{" "}
                    <code>/start A4</code>).
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    /move
                  </span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">
                    [square]
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Move the knight to a square (e.g.,{" "}
                    <code>/move B3</code>).
                    <br />
                    Columns: A-D, Rows: 1-4 (A1 and D1 are missing)
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    /undo
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Take back your last move.
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    /reset
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Start over with the current starting position.
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
                Lore: The bridge only holds if every stone is touched once. Choose a start, cross every stone, and return to where you began.
                Hint: Start at A4. A good opening is A4 {" -> "} C3 {" -> "} A2 {" -> "} C1. If you later reach B1, you're close to closing the loop.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/30 px-6 py-4 text-center flex-shrink-0">
              <button
                onClick={() => setHelpModalOpen(false)}
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

export default Level11;

