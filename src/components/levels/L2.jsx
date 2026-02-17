"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";

// Flower types positioned across the garden
const FLOWERS = [
  { id: "tulip1", type: "tulip", x: 45, color: "#FF6B6B" },
  { id: "rose1", type: "rose", x: 110, color: "#E91E63" },
  { id: "sunflower", type: "sunflower", x: 185, color: "#F9DC34" },
  { id: "daisy1", type: "daisy", x: 260, color: "#FFFFFF" },
  { id: "tulip2", type: "tulip", x: 335, color: "#CE93D8" },
];

const Level2 = ({ onComplete }) => {
  const [inputValue, setInputValue] = useState("");
  const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasObserved, setHasObserved] = useState(false);
  const [isDarkScene, setIsDarkScene] = useState(false);
  const [sunAnimating, setSunAnimating] = useState(false);
  const { toast } = useToast();
  const sunControls = useAnimation();
  const sunflowerControls = useAnimation();
  const petalControls = useAnimation();
  const stemControls = useAnimation();

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Correct! 🌻",
        description: "It's a sunflower — it always follows the sun!",
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
      const answer = enterMatch[1].trim().toLowerCase();
      if (answer === "sunflower") {
        setIsSuccess(true);
      } else {
        toast({
          title: "Incorrect",
          description: `"${enterMatch[1].trim()}" is not the right flower. Look more carefully!`,
          variant: "destructive"
      });
      }
    } else if (resetMatch) {
      setHasObserved(false);
      setIsDarkScene(false);
      sunControls.start({ y: 0, opacity: 1, transition: { duration: 0 } });
      sunflowerControls.start({ rotate: 0, transition: { duration: 0 } });
      petalControls.start({ scale: 1, transition: { duration: 0 } });
      stemControls.start({ d: "M185,155 Q185,125 185,95", transition: { duration: 0 } });
      toast({
        title: "Level Reset",
        description: "The garden has been reset.",
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

  // Render a flower SVG based on type
  const renderFlower = (flower) => {
    const isSunflower = flower.type === "sunflower";
    const stemHeight = 60;
    const groundY = 155;

    return (
      <g key={flower.id}>
        {/* Stem */}
        {isSunflower ? (
          <motion.path
            animate={stemControls}
            d="M185,155 Q185,125 185,95"
            stroke="#4CAF50"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <line
            x1={flower.x}
            y1={groundY}
            x2={flower.x}
            y2={groundY - stemHeight}
            stroke="#4CAF50"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}
        {/* Leaves */}
        <ellipse
          cx={flower.x - 10}
          cy={groundY - 25}
          rx="8"
          ry="4"
          fill="#66BB6A"
          transform={`rotate(-30, ${flower.x - 10}, ${groundY - 25})`}
        />
        <ellipse
          cx={flower.x + 10}
          cy={groundY - 38}
          rx="8"
          ry="4"
          fill="#66BB6A"
          transform={`rotate(30, ${flower.x + 10}, ${groundY - 38})`}
        />

        {/* Flower head */}
        {isSunflower ? (
          <motion.g
            animate={sunflowerControls}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            {/* Sunflower petals — animate scale to close/open */}
            <motion.g
              animate={petalControls}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            >
              {[...Array(10)].map((_, i) => (
                <ellipse
                  key={i}
                  cx={flower.x + Math.cos((i * 36 * Math.PI) / 180) * 14}
                  cy={groundY - stemHeight + Math.sin((i * 36 * Math.PI) / 180) * 14}
                  rx="7"
                  ry="4"
                  fill={flower.color}
                  transform={`rotate(${i * 36}, ${flower.x + Math.cos((i * 36 * Math.PI) / 180) * 14
                    }, ${groundY - stemHeight + Math.sin((i * 36 * Math.PI) / 180) * 14})`}
                />
              ))}
            </motion.g>
            {/* Sunflower center */}
            <circle
              cx={flower.x}
              cy={groundY - stemHeight}
              r="10"
              fill="#795548"
            />
            {/* Center dots */}
            <circle cx={flower.x - 3} cy={groundY - stemHeight - 2} r="1.5" fill="#5D4037" />
            <circle cx={flower.x + 3} cy={groundY - stemHeight + 2} r="1.5" fill="#5D4037" />
            <circle cx={flower.x} cy={groundY - stemHeight} r="1.5" fill="#5D4037" />
          </motion.g>
        ) : flower.type === "tulip" ? (
          <g>
            <path
              d={`M${flower.x - 10},${groundY - stemHeight + 5} Q${flower.x},${groundY - stemHeight - 18
                } ${flower.x + 10},${groundY - stemHeight + 5}`}
              fill={flower.color}
              stroke={flower.color}
              strokeWidth="1"
            />
            <path
              d={`M${flower.x - 10},${groundY - stemHeight + 5} Q${flower.x},${groundY - stemHeight + 2
                } ${flower.x + 10},${groundY - stemHeight + 5}`}
              fill={flower.color}
              opacity="0.7"
            />
          </g>
        ) : flower.type === "rose" ? (
          <g>
            {[...Array(6)].map((_, i) => (
              <ellipse
                key={i}
                cx={flower.x + Math.cos((i * 60 * Math.PI) / 180) * 8}
                cy={groundY - stemHeight + Math.sin((i * 60 * Math.PI) / 180) * 8}
                rx="6"
                ry="6"
                fill={flower.color}
                opacity="0.8"
              />
            ))}
            <circle
              cx={flower.x}
              cy={groundY - stemHeight}
              r="5"
              fill="#AD1457"
            />
          </g>
        ) : (
          /* daisy */
          <g>
            {[...Array(8)].map((_, i) => (
              <ellipse
                key={i}
                cx={flower.x + Math.cos((i * 45 * Math.PI) / 180) * 10}
                cy={groundY - stemHeight + Math.sin((i * 45 * Math.PI) / 180) * 10}
                rx="5"
                ry="3"
                fill={flower.color}
                transform={`rotate(${i * 45}, ${flower.x + Math.cos((i * 45 * Math.PI) / 180) * 10
                  }, ${groundY - stemHeight + Math.sin((i * 45 * Math.PI) / 180) * 10})`}
              />
            ))}
            <circle
              cx={flower.x}
              cy={groundY - stemHeight}
              r="5"
              fill="#FDD835"
            />
          </g>
        )}
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
        Name the flower.
      </motion.p>

      {/* Garden Scene */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-gradient-to-b from-[#87CEEB] via-[#B0E0FF] to-[#4CAF50] dark:from-[#1a2744] dark:via-[#1e3a5f] dark:to-[#2e4a2e] rounded-2xl p-0 shadow-lg border border-gray-200 dark:border-gray-700/30 w-full max-w-md relative overflow-hidden"
        style={{ minHeight: "260px" }}
      >
        <svg viewBox="0 0 400 200" className="w-full h-full">
          {/* Sky gradient is handled by the container div */}

          {/* Sun */}
          <motion.g animate={sunControls}>
            {/* Sun glow */}
            <circle cx="40" cy="40" r="30" fill="#FFF9C4" opacity="0.4" />
            {/* Sun body */}
            <circle cx="40" cy="40" r="20" fill="#FDD835" />
            {/* Sun rays */}
            {[...Array(8)].map((_, i) => (
              <line
                key={i}
                x1={40 + Math.cos((i * 45 * Math.PI) / 180) * 22}
                y1={40 + Math.sin((i * 45 * Math.PI) / 180) * 22}
                x2={40 + Math.cos((i * 45 * Math.PI) / 180) * 30}
                y2={40 + Math.sin((i * 45 * Math.PI) / 180) * 30}
                stroke="#FDD835"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ))}
            {/* Sun face */}
            <circle cx="34" cy="37" r="2" fill="#F57F17" />
            <circle cx="46" cy="37" r="2" fill="#F57F17" />
            <path
              d="M35,45 Q40,50 45,45"
              fill="none"
              stroke="#F57F17"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </motion.g>

          {/* Clouds */}
          <g opacity="0.7">
            <ellipse cx="280" cy="35" rx="30" ry="12" fill="white" />
            <ellipse cx="260" cy="30" rx="20" ry="10" fill="white" />
            <ellipse cx="300" cy="32" rx="18" ry="9" fill="white" />
          </g>
          <g opacity="0.5">
            <ellipse cx="150" cy="25" rx="22" ry="9" fill="white" />
            <ellipse cx="135" cy="22" rx="15" ry="8" fill="white" />
            <ellipse cx="168" cy="23" rx="14" ry="7" fill="white" />
          </g>

          {/* Ground */}
          <rect x="0" y="155" width="400" height="45" fill="#4CAF50" />
          <rect x="0" y="155" width="400" height="5" fill="#66BB6A" opacity="0.6" />

          {/* Grass tufts */}
          {[20, 70, 130, 220, 300, 360].map((gx, i) => (
            <g key={i}>
              <line x1={gx} y1={158} x2={gx - 3} y2={150} stroke="#388E3C" strokeWidth="1.5" />
              <line x1={gx} y1={158} x2={gx} y2={148} stroke="#43A047" strokeWidth="1.5" />
              <line x1={gx} y1={158} x2={gx + 3} y2={150} stroke="#388E3C" strokeWidth="1.5" />
            </g>
          ))}

          {/* Flowers */}
          {FLOWERS.map((flower) => renderFlower(flower))}

          {/* Moon (visible when dark) */}
          <AnimatePresence>
            {isDarkScene && (
              <motion.g
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 1.5 }}
              >
                <circle cx="320" cy="40" r="18" fill="#F5F5DC" />
                <circle cx="310" cy="35" r="18" fill="#1a2744" />
                {/* Stars */}
                <circle cx="100" cy="25" r="1.5" fill="white" opacity="0.8" />
                <circle cx="160" cy="50" r="1" fill="white" opacity="0.6" />
                <circle cx="250" cy="20" r="1.5" fill="white" opacity="0.7" />
                <circle cx="350" cy="70" r="1" fill="white" opacity="0.5" />
                <circle cx="60" cy="55" r="1" fill="white" opacity="0.6" />
                <circle cx="200" cy="35" r="1.5" fill="white" opacity="0.7" />
              </motion.g>
            )}
          </AnimatePresence>


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
                    /enter
                  </span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">[word]</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Enter the name of the flower.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    /reset
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Reset the garden scene.
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
              <p className="text-gray-600 dark:text-gray-300 italic">
                It seeks the eye that burns in the sky.
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

export default Level2;