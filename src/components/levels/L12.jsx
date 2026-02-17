"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { ArrowRight } from "lucide-react";

const JUG_5_MAX = 5;
const JUG_3_MAX = 3;
const TARGET = 4;

const Level12 = ({ onComplete }) => {
    const [inputValue, setInputValue] = useState("");
    const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
    const [isHelpModalOpen, setHelpModalOpen] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [jug5, setJug5] = useState(0);
    const [jug3, setJug3] = useState(0);
    const [moveCount, setMoveCount] = useState(0);
    const { toast } = useToast();

    useEffect(() => {
        if (jug5 === TARGET && !isSuccess) {
            setIsSuccess(true);
        }
    }, [jug5, isSuccess]);

    useEffect(() => {
        if (isSuccess) {
            toast({
                title: "Level Complete! ⚗️",
                description: `Exactly 4 liters in the 5L jug in ${moveCount} moves!`,
                variant: "success",
                className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
            });
            setTimeout(() => {
                onComplete();
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

    const parseJug = (s) => {
        const cleaned = s.trim().toLowerCase();
        if (cleaned === "5l" || cleaned === "5") return 5;
        if (cleaned === "3l" || cleaned === "3") return 3;
        return null;
    };

    const handleCommandSubmit = () => {
        pushCommand(inputValue);
        const cmd = inputValue.trim().toLowerCase();

        const fillMatch = cmd.match(/^\/fill\s+(.+)$/i);
        const emptyMatch = cmd.match(/^\/empty\s+(.+)$/i);
        const pourMatch = cmd.match(/^\/pour\s+(\S+)\s+(\S+)$/i);
        const resetMatch = cmd.match(/^\/reset$/i);
        const helpMatch = cmd.match(/^\/help$/i);

        if (fillMatch) {
            const jug = parseJug(fillMatch[1]);
            if (jug === 5) {
                setJug5(JUG_5_MAX);
                setMoveCount((p) => p + 1);
                toast({
                    title: "Filled 5L Jug 💧",
                    description: "The 5-liter jug is now full.",
                    variant: "default",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
                });
            } else if (jug === 3) {
                setJug3(JUG_3_MAX);
                setMoveCount((p) => p + 1);
                toast({
                    title: "Filled 3L Jug 💧",
                    description: "The 3-liter jug is now full.",
                    variant: "default",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
                });
            } else {
                toast({
                    title: "Invalid Jug",
                    description: "Specify 5L or 3L.",
                    variant: "destructive",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
                });
            }
        } else if (emptyMatch) {
            const jug = parseJug(emptyMatch[1]);
            if (jug === 5) {
                setJug5(0);
                setMoveCount((p) => p + 1);
                toast({
                    title: "Emptied 5L Jug",
                    description: "The 5-liter jug is now empty.",
                    variant: "default",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
                });
            } else if (jug === 3) {
                setJug3(0);
                setMoveCount((p) => p + 1);
                toast({
                    title: "Emptied 3L Jug",
                    description: "The 3-liter jug is now empty.",
                    variant: "default",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
                });
            } else {
                toast({
                    title: "Invalid Jug",
                    description: "Specify 5L or 3L.",
                    variant: "destructive",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
                });
            }
        } else if (pourMatch) {
            const from = parseJug(pourMatch[1]);
            const to = parseJug(pourMatch[2]);

            if (!from || !to || from === to) {
                toast({
                    title: "Invalid Pour",
                    description: "Use /pour 5L 3L or /pour 3L 5L",
                    variant: "destructive",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
                });
            } else if (from === 5 && to === 3) {
                const space = JUG_3_MAX - jug3;
                const poured = Math.min(jug5, space);
                setJug5((p) => p - poured);
                setJug3((p) => p + poured);
                setMoveCount((p) => p + 1);
                toast({
                    title: `Poured ${poured}L → 3L Jug`,
                    description: `5L: ${jug5 - poured}L | 3L: ${jug3 + poured}L`,
                    variant: "default",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
                });
            } else if (from === 3 && to === 5) {
                const space = JUG_5_MAX - jug5;
                const poured = Math.min(jug3, space);
                setJug3((p) => p - poured);
                setJug5((p) => p + poured);
                setMoveCount((p) => p + 1);
                toast({
                    title: `Poured ${poured}L → 5L Jug`,
                    description: `5L: ${jug5 + poured}L | 3L: ${jug3 - poured}L`,
                    variant: "default",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
                });
            }
        } else if (resetMatch) {
            setJug5(0);
            setJug3(0);
            setIsSuccess(false);
            setMoveCount(0);
            toast({
                title: "Level Reset",
                description: "Both jugs emptied. Start fresh!",
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

    const renderJug = (x, label, capacity, current, color) => {
        const jugWidth = 60;
        const jugHeight = 100;
        const jugY = 100;
        const innerPad = 3;
        const innerH = jugHeight - innerPad * 2;
        const waterHeight = current > 0 ? (current / capacity) * innerH : 0;
        const clipId = `jug-clip-${capacity}`;

        return (
            <g>
                <defs>
                    <clipPath id={clipId}>
                        <rect
                            x={x + innerPad}
                            y={jugY + innerPad}
                            width={jugWidth - innerPad * 2}
                            height={innerH}
                            rx="3"
                        />
                    </clipPath>
                </defs>
                <rect
                    x={x}
                    y={jugY}
                    width={jugWidth}
                    height={jugHeight}
                    rx="6"
                    fill="none"
                    stroke={color}
                    strokeWidth="2.5"
                />
                <rect
                    x={x + 2}
                    y={jugY + 2}
                    width={jugWidth - 4}
                    height={jugHeight - 4}
                    rx="4"
                    fill="#0a0a1a"
                />
                <g clipPath={`url(#${clipId})`}>
                    <motion.rect
                        x={x + innerPad}
                        width={jugWidth - innerPad * 2}
                        rx="3"
                        fill="#2196F3"
                        initial={false}
                        animate={{
                            height: waterHeight,
                            y: jugY + jugHeight - innerPad - waterHeight
                        }}
                        transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
                        opacity="0.8"
                    />
                    {current > 0 && (
                        <motion.line
                            x1={x + 8}
                            x2={x + jugWidth - 8}
                            stroke="#64B5F6"
                            strokeWidth="1.5"
                            opacity="0.6"
                            initial={false}
                            animate={{
                                y1: jugY + jugHeight - innerPad - waterHeight + 2,
                                y2: jugY + jugHeight - innerPad - waterHeight + 2
                            }}
                            transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
                        />
                    )}
                </g>
                {Array.from({ length: capacity }, (_, i) => {
                    const markY = jugY + jugHeight - innerPad - ((i + 1) / capacity) * innerH;
                    return (
                        <g key={i}>
                            <line
                                x1={x + jugWidth - 8}
                                y1={markY}
                                x2={x + jugWidth - 2}
                                y2={markY}
                                stroke={color}
                                strokeWidth="1"
                                opacity="0.4"
                            />
                        </g>
                    );
                })}
                <text
                    x={x + jugWidth / 2}
                    y={jugY + jugHeight / 2 + 5}
                    textAnchor="middle"
                    fontSize="20"
                    fill="white"
                    fontWeight="bold"
                    opacity="0.9"
                >
                    {current}L
                </text>
                <text
                    x={x + jugWidth / 2}
                    y={jugY - 8}
                    textAnchor="middle"
                    fontSize="12"
                    fill={color}
                    fontWeight="bold"
                >
                    {label}
                </text>
                <text
                    x={x + jugWidth / 2}
                    y={jugY + jugHeight + 18}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#8888BB"
                >
                    Max: {capacity}L
                </text>
            </g>
        );
    };

    return (
        <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="px-6 py-3 text-2xl font-bold text-[#1A1A1A] dark:text-[#111111] bg-gradient-to-r from-[#F9DC34] to-[#F5A623] rounded-full shadow-lg"
            >
                Level 12
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8 text-xl font-semibold mb-4 text-center text-gray-900 dark:text-[#F9DC34]"
            >
                Measure exactly 4 Liters in the 5L jug.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white dark:bg-[#1A1A1A]/40 rounded-2xl p-6 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700/30 w-full max-w-md relative overflow-hidden"
            >
                <svg viewBox="0 0 380 260" className="w-full">
                    {[...Array(16)].map((_, i) => (
                        <line key={`vg${i}`} x1={i * 25} y1={0} x2={i * 25} y2={260} stroke="#1a1a3a" strokeWidth="0.5" opacity="0.1" />
                    ))}
                    {[...Array(11)].map((_, i) => (
                        <line key={`hg${i}`} x1={0} y1={i * 25} x2={380} y2={i * 25} stroke="#1a1a3a" strokeWidth="0.5" opacity="0.1" />
                    ))}

                    {renderJug(110, "5L JUG", JUG_5_MAX, jug5, "#F9DC34")}
                    {renderJug(220, "3L JUG", JUG_3_MAX, jug3, "#A78BFA")}

                    <g opacity="0.3">
                        <line x1="175" y1="140" x2="215" y2="140" stroke="#F9DC34" strokeWidth="1.5" />
                        <polygon points="213,136 220,140 213,144" fill="#F9DC34" />
                        <line x1="215" y1="155" x2="175" y2="155" stroke="#A78BFA" strokeWidth="1.5" />
                        <polygon points="177,151 170,155 177,159" fill="#A78BFA" />
                    </g>
                </svg>
            </motion.div>

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
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/fill</span>{" "}
                                        <span className="text-blue-600 dark:text-blue-300">[5L or 3L]</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Fill a jug completely from the tap.</p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/empty</span>{" "}
                                        <span className="text-blue-600 dark:text-blue-300">[5L or 3L]</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Empty a jug into the drain.</p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/pour</span>{" "}
                                        <span className="text-blue-600 dark:text-blue-300">[from] [to]</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Pour water from one jug to another (e.g., /pour 5L 3L).</p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/reset</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Reset the level.</p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/help</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Show available commands and hints.</p>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-[#F9DC34]">
                                    Hint:
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 italic">
                                    Three and five make eight, but four is the middle path you must forge.
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

export default Level12;
