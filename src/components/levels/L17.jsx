"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { ArrowRight } from "lucide-react";

const TOTAL_COINS = 12;
const MAX_WEIGHINGS = 3;

const Level17 = ({ onComplete }) => {
    const [inputValue, setInputValue] = useState("");
    const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
    const [isHelpModalOpen, setHelpModalOpen] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isFailed, setIsFailed] = useState(false);
    const [fakeCoin, setFakeCoin] = useState(null);
    const [weighingsLeft, setWeighingsLeft] = useState(MAX_WEIGHINGS);
    const [weighHistory, setWeighHistory] = useState([]);
    const [scaleState, setScaleState] = useState("balanced");
    const [leftPan, setLeftPan] = useState([]); // coin IDs on left pan
    const [rightPan, setRightPan] = useState([]); // coin IDs on right pan
    const { toast } = useToast();
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            setFakeCoin(Math.floor(Math.random() * TOTAL_COINS) + 1);
        }
    }, []);

    useEffect(() => {
        if (isSuccess) {
            const weighingsUsed = MAX_WEIGHINGS - weighingsLeft;

            if (weighingsUsed < 3) {
                toast({
                    title: "Wait... That's a Bluff! 🤔",
                    description: "You can't identify the fake coin in less than 3 weighings without seeing the results!",
                    variant: "destructive",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
                });
                setIsSuccess(false);
                return;
            }

            toast({
                title: "Correct! 🪙",
                description: `Coin ${fakeCoin} was the fake! Found in ${weighingsUsed} turn(s).`,
                variant: "success",
                className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
            });
            setTimeout(() => {
                onComplete();
            }, 2000);
        }
    }, [isSuccess, onComplete, toast, fakeCoin, weighingsLeft]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleEnter = (e) => {
        if (e.key === "Enter") {
            handleCommandSubmit();
        }
    };

    const parseCoins = (str) => {
        const parts = str.split(",").map((s) => parseInt(s.trim()));
        if (parts.some((n) => isNaN(n) || n < 1 || n > TOTAL_COINS)) return null;
        if (new Set(parts).size !== parts.length) return null;
        return parts;
    };

    const handleCommandSubmit = () => {
        pushCommand(inputValue);
        const cmd = inputValue.trim();

        const weighMatch = cmd.match(/^\/weigh\s+(.+?)\s+(?:vs\s+)?(.+)$/i);
        const guessMatch = cmd.match(/^\/guess\s+(\d+)$/i);
        const resetMatch = cmd.match(/^\/reset$/i);
        const helpMatch = cmd.match(/^\/help$/i);



        if (isFailed && !resetMatch && !helpMatch) {
            toast({
                title: "No Weighings Left",
                description: "Use /reset to try again.",
                variant: "destructive",
                className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
            });
            setInputValue("");
            return;
        }

        if (weighMatch) {
            if (weighingsLeft <= 0) {
                toast({
                    title: "No Weighings Left!",
                    description: "You've used all 3 weighings. Make your /guess now!",
                    variant: "destructive",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
                });
                setInputValue("");
                return;
            }

            const leftCoins = parseCoins(weighMatch[1]);
            const rightCoins = parseCoins(weighMatch[2]);

            if (!leftCoins || !rightCoins) {
                toast({
                    title: "Invalid Coins",
                    description: "Use coin numbers 1-12 separated by commas. e.g., /weigh 1,2,3,4 5,6,7,8",
                    variant: "destructive",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
                });
                setInputValue("");
                return;
            }

            if (leftCoins.length !== rightCoins.length) {
                toast({
                    title: "Uneven Groups",
                    description: "Both sides must have the same number of coins.",
                    variant: "destructive",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
                });
                setInputValue("");
                return;
            }

            const overlap = leftCoins.some((c) => rightCoins.includes(c));
            if (overlap) {
                toast({
                    title: "Duplicate Coins",
                    description: "A coin can't be on both sides of the scale!",
                    variant: "destructive",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
                });
                setInputValue("");
                return;
            }

            const fakeOnLeft = leftCoins.includes(fakeCoin);
            const fakeOnRight = rightCoins.includes(fakeCoin);

            let result;
            if (fakeOnLeft) {
                result = "left-lighter";
                setScaleState("left-lighter");
            } else if (fakeOnRight) {
                result = "right-lighter";
                setScaleState("right-lighter");
            } else {
                result = "equal";
                setScaleState("balanced");
            }

            setLeftPan(leftCoins);
            setRightPan(rightCoins);
            setWeighingsLeft((p) => p - 1);

            setWeighHistory((prev) => [
                ...prev,
                { left: leftCoins, right: rightCoins, result },
            ]);

            const resultText =
                result === "equal"
                    ? "⚖️ Both sides are equal!"
                    : result === "left-lighter"
                        ? "⬅️ Left side is LIGHTER!"
                        : "➡️ Right side is LIGHTER!";

            toast({
                title: resultText,
                description: `Weighings remaining: ${weighingsLeft - 1}`,
                variant: "default",
                className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
            });
        } else if (guessMatch) {
            const coinNum = parseInt(guessMatch[1]);
            if (coinNum < 1 || coinNum > TOTAL_COINS) {
                toast({
                    title: "Invalid Coin",
                    description: "Choose a coin from 1 to 12.",
                    variant: "destructive",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
                });
            } else if (coinNum === fakeCoin) {
                setIsSuccess(true);
            } else {
                setIsFailed(true);
                toast({
                    title: "Wrong! 💀",
                    description: `Coin ${coinNum} is real. The fake was coin ${fakeCoin}.`,
                    variant: "destructive",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
                });
            }
        } else if (resetMatch) {
            initialized.current = true;
            setFakeCoin(Math.floor(Math.random() * TOTAL_COINS) + 1);
            setWeighingsLeft(MAX_WEIGHINGS);
            setWeighHistory([]);
            setScaleState("balanced");
            setLeftPan([]);
            setRightPan([]);
            setIsSuccess(false);
            setIsFailed(false);
            toast({
                title: "Level Reset",
                description: "A new fake coin has been placed. Good luck!",
                variant: "default",
                className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
            });
        } else if (helpMatch) {
            setHelpModalOpen(true);
        } else {
            toast({
                title: "Unknown Command",
                description: "Type /help to see available commands",
                variant: "destructive",
                className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
            });
        }

        setInputValue("");
    };

    const tiltAngle =
        scaleState === "left-lighter" ? 8 : scaleState === "right-lighter" ? -8 : 0;

    const getScaleLayout = (count) => {
        if (count <= 3) return { perRow: 3, spacing: 18, coinR: 9 };
        if (count <= 4) return { perRow: 2, spacing: 16, coinR: 8 };
        return { perRow: 3, spacing: 14, coinR: 7 };
    };

    const getCoinPosition = (coinNum) => {
        const leftIdx = leftPan.indexOf(coinNum);
        const rightIdx = rightPan.indexOf(coinNum);

        if (leftIdx !== -1) {
            const { perRow, spacing } = getScaleLayout(leftPan.length);
            const row = Math.floor(leftIdx / perRow);
            const col = leftIdx % perRow;
            const totalInRow = Math.min(perRow, leftPan.length - row * perRow);
            const startX = 80 - (totalInRow * spacing) / 2;
            return { x: startX + col * spacing, y: 127 + row * spacing, onScale: true, side: "left" };
        }

        if (rightIdx !== -1) {
            const { perRow, spacing } = getScaleLayout(rightPan.length);
            const row = Math.floor(rightIdx / perRow);
            const col = rightIdx % perRow;
            const totalInRow = Math.min(perRow, rightPan.length - row * perRow);
            const startX = 300 - (totalInRow * spacing) / 2;
            return { x: startX + col * spacing, y: 127 + row * spacing, onScale: true, side: "right" };
        }

        const groundCoins = [];
        for (let i = 1; i <= TOTAL_COINS; i++) {
            if (!leftPan.includes(i) && !rightPan.includes(i)) {
                groundCoins.push(i);
            }
        }
        const groundIdx = groundCoins.indexOf(coinNum);
        const perRow = 6;
        const row = Math.floor(groundIdx / perRow);
        const col = groundIdx % perRow;
        const totalInRow = Math.min(perRow, groundCoins.length - row * perRow);
        const startX = 190 - (totalInRow * 30) / 2;
        return { x: startX + col * 30, y: 215 + row * 28, onScale: false, side: "ground" };
    };

    return (
        <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="px-6 py-3 text-2xl font-bold text-[#1A1A1A] dark:text-[#111111] bg-gradient-to-r from-[#F9DC34] to-[#F5A623] rounded-full shadow-lg"
            >
                Level 17
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8 text-xl font-semibold mb-4 text-center text-gray-900 dark:text-[#F9DC34]"
            >
                The 12-Coin Balance — Find the fake coin.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white dark:bg-[#1A1A1A]/40 rounded-2xl p-6 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700/30 w-full max-w-md relative overflow-hidden"
            >
                <svg viewBox="0 0 380 300" className="w-full">
                    {[...Array(16)].map((_, i) => (
                        <line key={`v${i}`} x1={i * 25} y1={0} x2={i * 25} y2={280} stroke="#1a1a3a" strokeWidth="0.5" opacity="0.1" />
                    ))}
                    {[...Array(12)].map((_, i) => (
                        <line key={`h${i}`} x1={0} y1={i * 25} x2={380} y2={i * 25} stroke="#1a1a3a" strokeWidth="0.5" opacity="0.1" />
                    ))}

                    <rect x="185" y="100" width="10" height="65" fill="#795548" rx="2" />
                    <rect x="170" y="160" width="40" height="8" rx="3" fill="#5D4037" />
                    <polygon points="190,95 180,105 200,105" fill="#5D4037" />

                    <motion.g
                        animate={{ rotate: tiltAngle }}
                        transition={{ type: "spring", stiffness: 150, damping: 20 }}
                        style={{ originX: "190px", originY: "100px" }}
                    >
                        <rect x="45" y="96" width="290" height="7" rx="3" fill="#8D6E63" />
                        <line x1="65" y1="103" x2="55" y2="145" stroke="#A1887F" strokeWidth="2" />
                        <line x1="95" y1="103" x2="105" y2="145" stroke="#A1887F" strokeWidth="2" />
                        <ellipse cx="80" cy="148" rx="45" ry="10" fill="#8D6E63" stroke="#6D4C41" strokeWidth="1.5" />
                        <text x="80" y="165" textAnchor="middle" fontSize="9" fill="#BCAAA4">LEFT</text>

                        <line x1="285" y1="103" x2="275" y2="145" stroke="#A1887F" strokeWidth="2" />
                        <line x1="315" y1="103" x2="325" y2="145" stroke="#A1887F" strokeWidth="2" />
                        <ellipse cx="300" cy="148" rx="45" ry="10" fill="#8D6E63" stroke="#6D4C41" strokeWidth="1.5" />
                        <text x="300" y="165" textAnchor="middle" fontSize="9" fill="#BCAAA4">RIGHT</text>

                        {leftPan.map((coinNum, i) => {
                            const pos = getCoinPosition(coinNum);
                            const { coinR } = getScaleLayout(leftPan.length);
                            return (
                                <motion.g
                                    key={`scale-L-${coinNum}`}
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.4, delay: i * 0.05 }}
                                >
                                    <circle
                                        cx={pos.x}
                                        cy={pos.y}
                                        r={coinR}
                                        fill={isSuccess && coinNum === fakeCoin ? "#ef4444" : isFailed && coinNum === fakeCoin ? "#ef4444" : "#F9DC34"}
                                        stroke={isSuccess && coinNum === fakeCoin ? "#dc2626" : isFailed && coinNum === fakeCoin ? "#dc2626" : "#F5A623"}
                                        strokeWidth="1.5"
                                    />
                                    <text x={pos.x} y={pos.y + 3.5} textAnchor="middle" fontSize="8" fill="#2D1B4B" fontWeight="bold">
                                        {coinNum}
                                    </text>
                                </motion.g>
                            );
                        })}

                        {rightPan.map((coinNum, i) => {
                            const pos = getCoinPosition(coinNum);
                            const { coinR } = getScaleLayout(rightPan.length);
                            return (
                                <motion.g
                                    key={`scale-R-${coinNum}`}
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.4, delay: i * 0.05 }}
                                >
                                    <circle
                                        cx={pos.x}
                                        cy={pos.y}
                                        r={coinR}
                                        fill={isSuccess && coinNum === fakeCoin ? "#ef4444" : isFailed && coinNum === fakeCoin ? "#ef4444" : "#F9DC34"}
                                        stroke={isSuccess && coinNum === fakeCoin ? "#dc2626" : isFailed && coinNum === fakeCoin ? "#dc2626" : "#F5A623"}
                                        strokeWidth="1.5"
                                    />
                                    <text x={pos.x} y={pos.y + 3.5} textAnchor="middle" fontSize="8" fill="#2D1B4B" fontWeight="bold">
                                        {coinNum}
                                    </text>
                                </motion.g>
                            );
                        })}
                    </motion.g>

                    <line x1="30" y1="200" x2="350" y2="200" stroke="#333355" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
                    <text x="190" y="195" textAnchor="middle" fontSize="8" fill="#555577">COINS ON THE TABLE</text>

                    {Array.from({ length: TOTAL_COINS }, (_, i) => {
                        const coinNum = i + 1;
                        if (leftPan.includes(coinNum) || rightPan.includes(coinNum)) return null;
                        const pos = getCoinPosition(coinNum);

                        return (
                            <motion.g
                                key={`ground-${coinNum}`}
                                animate={{ x: 0, y: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                            >
                                <circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r="11"
                                    fill={isSuccess && coinNum === fakeCoin ? "#ef4444" : isFailed && coinNum === fakeCoin ? "#ef4444" : "#F9DC34"}
                                    stroke={isSuccess && coinNum === fakeCoin ? "#dc2626" : isFailed && coinNum === fakeCoin ? "#dc2626" : "#F5A623"}
                                    strokeWidth="1.5"
                                    opacity={isFailed && coinNum !== fakeCoin ? 0.4 : 0.9}
                                />
                                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="10" fill="#2D1B4B" fontWeight="bold">
                                    {coinNum}
                                </text>
                            </motion.g>
                        );
                    })}
                </svg>
            </motion.div>

            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mx-10 my-6 text-center cursor-pointer text-gray-700 dark:text-gray-300 hover:text-[#F5A623] dark:hover:text-[#F9DC34] transition-colors"
                onClick={() => setHelpModalOpen(true)}
            >
                Type <span className="font-mono bg-gray-100 dark:bg-gray-900/30 px-2 py-1 rounded">/help</span> to get commands and hints
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
                    onChange={handleInputChange}
                    onKeyDown={(e) => { handleEnter(e); handleHistoryKeys(e); }}
                    placeholder="Enter command..."
                    className="border-gray-300 dark:border-gray-600/50 bg-white dark:bg-[#111111]/70 shadow-inner focus:ring-[#F5A623] focus:border-[#F9DC34]"
                />
                <button
                    onClick={handleCommandSubmit}
                    className="bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] p-2 rounded-lg shadow-md transition-transform hover:scale-105 flex items-center justify-center w-12"
                >
                    <ArrowRight className="w-5 h-5 text-gray-900" />
                </button>
            </motion.div>

            <AnimatePresence>
                {isHelpModalOpen && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden shadow-2xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
                        >
                            <div className="p-6 overflow-y-auto flex-grow">
                                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-[#F9DC34]">
                                    Available Commands:
                                </h2>
                                <div className="space-y-1 mb-6">
                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/weigh</span>{" "}
                                        <span className="text-blue-600 dark:text-blue-300">[left] [right]</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Weigh two groups. e.g., /weigh 1,2,3 4,5,6</p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/guess</span>{" "}
                                        <span className="text-blue-600 dark:text-blue-300">[coin]</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Guess the fake coin number.</p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/reset</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Reset the level.</p>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-[#F9DC34]">
                                    Hint:
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 italic">
                                    Balance is truth, but the lighter soul is the liar. Three chances to weigh the world.
                                </p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/30 px-6 py-4 text-center">
                                <button
                                    onClick={() => setHelpModalOpen(false)}
                                    className="bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] px-6 py-2 rounded-lg text-gray-900 font-medium shadow-md transition-transform hover:scale-105"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Level17;
