"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion, useAnimation } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

const Level3 = ({ onComplete }) => {
  const [inputValue, setInputValue] = useState("");
  const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mirrorAngle, setMirrorAngle] = useState(0); // 0° = vertical, 45° = tilted right to hit target
  const [hasFired, setHasFired] = useState(false);
  const [fireResult, setFireResult] = useState(null); // "hit" | "miss" | null
  const [laserAnimating, setLaserAnimating] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // SVG coordinates
  const LASER_X = 30;
  const LASER_Y = 80;
  const MIRROR_CX = 250;
  const MIRROR_CY = 80;
  const TARGET_CX = 250;
  const TARGET_CY = 270;
  const MIRROR_LEN = 40;
  const SVG_W = 400;
  const SVG_H = 325;
  const HIT_RADIUS = 22;

  // Mirror visual rotation: 0° = vertical (no rotation), 45° = tilted 45° clockwise
  const mirrorRotation = -mirrorAngle;

  // Reflected beam physics (0° = vertical mirror → beam bounces back)
  const thetaRad = (mirrorAngle * Math.PI) / 180;
  const reflectDx = -Math.cos(2 * thetaRad);
  const reflectDy = Math.sin(2 * thetaRad);

  // Find where reflected beam exits the SVG viewport (or stops at target)
  const computeBeamEnd = (stopAtTarget = false) => {
    const candidates = [];
    if (reflectDx > 0.001) candidates.push((SVG_W - MIRROR_CX) / reflectDx);
    if (reflectDx < -0.001) candidates.push(-MIRROR_CX / reflectDx);
    if (reflectDy > 0.001) candidates.push((SVG_H - MIRROR_CY) / reflectDy);
    if (reflectDy < -0.001) candidates.push(-MIRROR_CY / reflectDy);

    // If stopAtTarget, also consider the parametric t that reaches the target center
    if (stopAtTarget) {
      const dx = reflectDx;
      const dy = reflectDy;
      const len2 = dx * dx + dy * dy;
      if (len2 > 0) {
        const tx = TARGET_CX - MIRROR_CX;
        const ty = TARGET_CY - MIRROR_CY;
        const tParam = (tx * dx + ty * dy) / len2;
        if (tParam > 0) {
          const closestX = MIRROR_CX + tParam * dx;
          const closestY = MIRROR_CY + tParam * dy;
          const dist = Math.sqrt((closestX - TARGET_CX) ** 2 + (closestY - TARGET_CY) ** 2);
          if (dist < HIT_RADIUS) {
            // Beam stops exactly at target center
            return { x: TARGET_CX, y: TARGET_CY, isTargetHit: true };
          }
        }
      }
    }

    const positives = candidates.filter((t) => t > 0);
    if (positives.length === 0) return { x: MIRROR_CX, y: MIRROR_CY, isTargetHit: false };
    const t = Math.min(...positives);
    return {
      x: MIRROR_CX + t * reflectDx,
      y: MIRROR_CY + t * reflectDy,
      isTargetHit: false,
    };
  };

  // Check if reflected beam passes close enough to the target
  const checkHit = () => {
    const end = computeBeamEnd();
    const dx = end.x - MIRROR_CX;
    const dy = end.y - MIRROR_CY;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return false;
    const tx = TARGET_CX - MIRROR_CX;
    const ty = TARGET_CY - MIRROR_CY;
    const param = Math.max(0, Math.min(1, (tx * dx + ty * dy) / len2));
    const closestX = MIRROR_CX + param * dx;
    const closestY = MIRROR_CY + param * dy;
    const dist = Math.sqrt(
      (closestX - TARGET_CX) ** 2 + (closestY - TARGET_CY) ** 2
    );
    return dist < HIT_RADIUS;
  };

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Target Hit! 🎯",
        description: "The laser reflected perfectly to the target!",
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

  const handleFire = () => {
    if (laserAnimating) return;
    setLaserAnimating(true);
    setHasFired(true);
    setAttempts((prev) => prev + 1);

    if (mirrorAngle === 45) {
      setFireResult("hit");
      setTimeout(() => {
        setIsSuccess(true);
        setLaserAnimating(false);
      }, 1500);
    } else {
      setFireResult("miss");
      setTimeout(() => {
        setLaserAnimating(false);
        toast({
          title: "Missed! 💥",
          description:
            mirrorAngle === 90
              ? "The laser bounced straight back! The mirror is vertical."
              : `Attempt ${attempts + 1}: The beam didn't reach the target. Adjust the mirror angle.`,
          variant: "destructive"
        });
        // Auto-reset fire state so player can try again
        setTimeout(() => {
          setFireResult(null);
          setHasFired(false);
        }, 800);
      }, 1200);
    }
  };

  const handleCommandSubmit = () => {
    pushCommand(inputValue);
    const cmd = inputValue.trim().toLowerCase();

    const rotateMatch = cmd.match(/^\/rotate\s+mirror\s+(\d+)$/i);
    const fireMatch = cmd.match(/^\/fire$/i);
    const resetMatch = cmd.match(/^\/reset$/i);
    const helpMatch = cmd.match(/^\/help$/i);

    if (rotateMatch) {
      const angle = parseInt(rotateMatch[1]);
      if (angle >= 0 && angle <= 360) {
        setMirrorAngle(angle);
        setFireResult(null);
        setHasFired(false);
        toast({
          title: "Mirror Rotated",
          description: `Mirror set to ${angle}°`,
          variant: "default",
        });
      } else {
        toast({
          title: "Invalid Angle",
          description: "The mirror angle must be between 0° and 360°.",
          variant: "destructive",
        });
      }
    } else if (fireMatch) {
      handleFire();
    } else if (resetMatch) {
      setMirrorAngle(0);
      setFireResult(null);
      setHasFired(false);
      setIsSuccess(false);
      setAttempts(0);
      toast({
        title: "Level Reset",
        description: "Mirror reset to 0° (vertical). Laser ready.",
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

  // Compute laser beam path for any angle
  const renderLaserBeam = () => {
    if (!hasFired) return null;

    const isHit = fireResult === "hit";
    const beamEnd = computeBeamEnd(isHit);

    // Compute beam length for animation timing
    const reflectedLen = Math.sqrt(
      (beamEnd.x - MIRROR_CX) ** 2 + (beamEnd.y - MIRROR_CY) ** 2
    );
    const incomingLen = MIRROR_CX - (LASER_X + 30);
    const reflectDuration = Math.min(0.8, (reflectedLen / incomingLen) * 0.4);

    return (
      <>
        {/* Incoming beam: gun → mirror */}
        <motion.line
          x1={LASER_X + 30}
          y1={LASER_Y}
          x2={MIRROR_CX}
          y2={MIRROR_CY}
          stroke="#FF0000"
          strokeWidth="3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{ filter: "drop-shadow(0 0 6px #FF0000)" }}
        />
        {/* Reflected beam: mirror → computed endpoint */}
        <motion.line
          x1={MIRROR_CX}
          y1={MIRROR_CY}
          x2={beamEnd.x}
          y2={beamEnd.y}
          stroke={isHit ? "#FF0000" : "#FF4444"}
          strokeWidth={isHit ? 3 : 2}
          strokeDasharray={isHit ? "none" : "6 4"}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: isHit ? 1 : 0.7 }}
          transition={{ duration: reflectDuration, delay: 0.4 }}
          style={{ filter: `drop-shadow(0 0 ${isHit ? 6 : 4}px ${isHit ? "#FF0000" : "#FF4444"})` }}
        />
        {/* Spark on mirror */}
        <motion.circle
          cx={MIRROR_CX}
          cy={MIRROR_CY}
          r="8"
          fill="#FFAA00"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
          transition={{ duration: 0.5, delay: 0.35 }}
        />
        {/* Hit glow on target */}
        {isHit && (
          <motion.circle
            cx={TARGET_CX}
            cy={TARGET_CY}
            r="20"
            fill="#FF0000"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.5, 0.3], scale: [0, 1.5, 1] }}
            transition={{ duration: 0.5, delay: 0.4 + reflectDuration }}
            style={{ filter: "blur(8px)" }}
          />
        )}
        {/* Miss impact on wall */}
        {!isHit && (
          <motion.circle
            cx={beamEnd.x}
            cy={beamEnd.y}
            r="6"
            fill="#FF6600"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0, 1.2, 0] }}
            transition={{ duration: 0.5, delay: 0.4 + reflectDuration }}
          />
        )}
      </>
    );
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
        className="mt-8 text-lg font-semibold mb-4 text-center text-purple-900 dark:text-[#F9DC34]"
      >
        Hit the target with the laser.
      </motion.p>

      {/* Scene */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-[#0a0a1a] dark:bg-[#0a0a1a] rounded-2xl p-0 shadow-lg border border-purple-700/30 w-full max-w-md relative overflow-hidden"
      >
        <svg viewBox="0 0 400 325" className="w-full">
          {/* Grid background */}
          {[...Array(16)].map((_, i) => (
            <line
              key={`vg${i}`}
              x1={i * 25}
              y1={0}
              x2={i * 25}
              y2={310}
              stroke="#1a1a3a"
              strokeWidth="0.5"
            />
          ))}
          {[...Array(13)].map((_, i) => (
            <line
              key={`hg${i}`}
              x1={0}
              y1={i * 25}
              x2={400}
              y2={i * 25}
              stroke="#1a1a3a"
              strokeWidth="0.5"
            />
          ))}

          {/* Laser gun (left side, pointing right) */}
          <g>
            {/* Gun body */}
            <rect
              x={LASER_X - 10}
              y={LASER_Y - 12}
              width="40"
              height="24"
              rx="4"
              fill="#4A4A6A"
              stroke="#6A6A9A"
              strokeWidth="1.5"
            />
            {/* Gun barrel */}
            <rect
              x={LASER_X + 25}
              y={LASER_Y - 5}
              width="18"
              height="10"
              rx="2"
              fill="#5A5A7A"
              stroke="#7A7AAA"
              strokeWidth="1"
            />
            {/* Gun emitter glow */}
            <circle
              cx={LASER_X + 43}
              cy={LASER_Y}
              r="4"
              fill={hasFired ? "#FF0000" : "#FF000060"}
            >
              {hasFired && (
                <animate
                  attributeName="opacity"
                  values="1;0.5;1"
                  dur="0.3s"
                  repeatCount="3"
                />
              )}
            </circle>

          </g>

          {/* Dotted guide line showing laser path (before firing) */}
          {!hasFired && (
            <line
              x1={LASER_X + 43}
              y1={LASER_Y}
              x2={MIRROR_CX}
              y2={MIRROR_CY}
              stroke="#FF000030"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          )}

          {/* Mirror */}
          <motion.g
            animate={{ rotate: mirrorRotation }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            style={{
              originX: 0.5,
              originY: 0.5,
            }}
          >
            {/* Mirror surface (reflective) */}
            <line
              x1={MIRROR_CX}
              y1={MIRROR_CY - MIRROR_LEN}
              x2={MIRROR_CX}
              y2={MIRROR_CY + MIRROR_LEN}
              stroke="#B0C4DE"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Mirror shine */}
            <line
              x1={MIRROR_CX - 1}
              y1={MIRROR_CY - MIRROR_LEN + 5}
              x2={MIRROR_CX - 1}
              y2={MIRROR_CY + MIRROR_LEN - 5}
              stroke="#E0E8F0"
              strokeWidth="1.5"
              opacity="0.6"
            />
            {/* Mirror frame top */}
            <circle
              cx={MIRROR_CX}
              cy={MIRROR_CY - MIRROR_LEN}
              r="3"
              fill="#7A7AAA"
            />
            {/* Mirror frame bottom */}
            <circle
              cx={MIRROR_CX}
              cy={MIRROR_CY + MIRROR_LEN}
              r="3"
              fill="#7A7AAA"
            />
          </motion.g>



          {/* Target (bottom center) */}
          <g>
            {/* Target outer ring */}
            <circle
              cx={TARGET_CX}
              cy={TARGET_CY}
              r="22"
              fill="none"
              stroke="#FF4444"
              strokeWidth="2.5"
            />
            <circle
              cx={TARGET_CX}
              cy={TARGET_CY}
              r="15"
              fill="none"
              stroke="#FF6666"
              strokeWidth="2"
            />
            <circle
              cx={TARGET_CX}
              cy={TARGET_CY}
              r="8"
              fill="none"
              stroke="#FF8888"
              strokeWidth="1.5"
            />
            {/* Bullseye */}
            <circle
              cx={TARGET_CX}
              cy={TARGET_CY}
              r="3"
              fill={fireResult === "hit" ? "#00FF00" : "#FF4444"}
            />

          </g>

          {/* Laser beam */}
          {renderLaserBeam()}


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
                    /rotate mirror
                  </span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">[angle]</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Set the mirror angle (0–180 degrees).
                    <br />
                    e.g., <code>/rotate mirror 45</code>
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    /fire
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Fire the laser beam.
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    /reset
                  </span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Reset the mirror and laser.
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
                Equality is found in the bounce; seek the perfect tilt.
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

export default Level3;