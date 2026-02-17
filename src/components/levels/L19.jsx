"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { useTheme } from "next-themes";
import { ArrowRight } from "lucide-react";

const PASSWORD = "unlock";
const MAX_BRIGHTNESS = 5;

const Level19 = ({ onComplete }) => {
    const [inputValue, setInputValue] = useState("");
    const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
    const [isHelpModalOpen, setHelpModalOpen] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [brightness, setBrightness] = useState(0); // 0 = black, 5 = full
    const [hasLooked, setHasLooked] = useState(false);
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        if (isSuccess) {
            toast({
                title: "Access Granted! 🔓",
                description: 'The password was "unlock"!',
                variant: "success",
                className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
            });
            setTimeout(() => {
                onComplete();
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

        const themeMatch = cmd.match(/^\/theme\s+(dark|light)$/i);
        const increaseBright = cmd.match(/^\/increase\s+brightness$/i);
        const decreaseBright = cmd.match(/^\/decrease\s+brightness$/i);
        const lookMatch = cmd.match(/^\/look$/i);
        const enterMatch = cmd.match(/^\/enter\s+(.+)$/i);
        const resetMatch = cmd.match(/^\/reset$/i);
        const helpMatch = cmd.match(/^\/help$/i);

        if (themeMatch) {
            setTheme(themeMatch[1].toLowerCase());
            toast({
                title: themeMatch[1].toLowerCase() === "dark" ? "🌙 Theme Changed" : "☀️ Theme Changed",
                description: `Switched to ${themeMatch[1].toLowerCase()} mode`,
                variant: "default",
                className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
            });
        } else if (increaseBright) {
            if (brightness >= MAX_BRIGHTNESS) {
                toast({
                    title: "Max brightness!",
                    description: "The screen is already at full brightness.",
                    variant: "default",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
                });
            } else {
                setBrightness((b) => b + 1);
                setHasLooked(false);
                toast({
                    title: `Brightness: ${brightness + 1}/${MAX_BRIGHTNESS} ☀️`,
                    description: brightness + 1 >= 3 ? "The screen is getting readable..." : "Still quite dim...",
                    variant: "default",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
                });
            }
        } else if (decreaseBright) {
            if (brightness <= 0) {
                toast({
                    title: "Already off!",
                    description: "The screen can't get any darker.",
                    variant: "default",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
                });
            } else {
                setBrightness((b) => b - 1);
                setHasLooked(false);
                toast({
                    title: `Brightness: ${brightness - 1}/${MAX_BRIGHTNESS}`,
                    description: "The screen dims...",
                    variant: "default",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
                });
            }
        } else if (lookMatch) {
            setHasLooked(true);
            if (brightness === 0) {
                toast({
                    title: "Too dark! 🌑",
                    description: "You can't see anything. The screen is completely black.",
                    variant: "destructive",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
                });
            } else if (brightness <= 2) {
                toast({
                    title: "Barely visible... 👀",
                    description: "You can make out a faint message but can't read it clearly.",
                    variant: "default",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
                });
            } else {
                toast({
                    title: "You can see the password! 👁️",
                    description: 'The screen reads: "unlock"',
                    variant: "default",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
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
                        ? "Can you even read what's on screen?"
                        : `"${guess}" is incorrect. Look at the screen carefully.`,
                    variant: "destructive",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
                });
            }
        } else if (resetMatch) {
            setBrightness(0);
            setHasLooked(false);
            setIsSuccess(false);
            toast({
                title: "Level Reset",
                description: "Screen returned to black.",
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

    const screenOpacity = brightness / MAX_BRIGHTNESS;
    const bgBrightness = Math.round(10 + (brightness / MAX_BRIGHTNESS) * 30);

    return (
        <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="px-6 py-3 text-2xl font-bold text-[#1A1A1A] dark:text-[#111111] bg-gradient-to-r from-[#F9DC34] to-[#F5A623] rounded-full shadow-lg"
            >
                Level 19
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8 text-xl font-semibold mb-4 text-center text-gray-900 dark:text-[#F9DC34]"
            >
                The Brightness Lock — Find the password.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full max-w-md relative"
            >
                <div className="bg-[#1a1a2e] rounded-2xl p-3 border border-[#333] shadow-lg">
                    <motion.div
                        animate={{
                            backgroundColor: `rgb(${bgBrightness}, ${bgBrightness}, ${bgBrightness + 10})`,
                        }}
                        transition={{ duration: 0.6 }}
                        className="rounded-lg relative overflow-hidden flex flex-col items-center justify-center p-6"
                        style={{ minHeight: 220 }}
                    >
                        <div
                            className="absolute inset-0 pointer-events-none z-10"
                            style={{
                                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
                            }}
                        />

                        <div className="relative mb-4 text-center">
                            <motion.div animate={{ opacity: screenOpacity }} transition={{ duration: 0.5 }}>
                                <p
                                    className="text-4xl font-bold font-mono tracking-widest"
                                    style={{
                                        color: `rgba(74, 222, 128, ${screenOpacity})`,
                                        textShadow: brightness >= 3 ? "0 0 10px rgba(74, 222, 128, 0.5)" : "none",
                                    }}
                                >
                                    {brightness >= 3 ? "unlock" : brightness >= 1 ? "██████" : ""}
                                </p>
                            </motion.div>
                        </div>

                        <motion.div
                            animate={{ opacity: 0.05 + screenOpacity * 0.8 }}
                            className="w-48 border rounded px-3 py-1.5 text-center font-mono text-sm"
                            style={{
                                borderColor: `rgba(120, 120, 180, ${0.1 + screenOpacity * 0.5})`,
                                color: `rgba(200, 200, 220, ${screenOpacity * 0.8})`,
                                backgroundColor: `rgba(0, 0, 0, 0.3)`,
                            }}
                        >
                            Enter password...
                        </motion.div>

                        {hasLooked && brightness >= 3 && (
                            <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: screenOpacity * 0.9 }} className="mt-3 text-xs font-mono" style={{ color: `rgba(249, 220, 52, ${screenOpacity * 0.9})` }}>
                                👁️ The password is &quot;unlock&quot;
                            </motion.p>
                        )}

                        <div className="absolute bottom-2 right-3 flex gap-0.5 z-20">
                            {Array.from({ length: MAX_BRIGHTNESS }, (_, i) => (
                                <div key={i} className="w-2 h-3 rounded-sm" style={{ backgroundColor: i < brightness ? `rgba(249, 220, 52, ${0.3 + (brightness / MAX_BRIGHTNESS) * 0.7})` : `rgba(60, 60, 80, ${0.1 + screenOpacity * 0.3})` }} />
                            ))}
                        </div>

                        <div className="absolute bottom-2 left-3 z-20">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brightness > 0 ? "#22c55e" : "#333", boxShadow: brightness > 0 ? "0 0 4px #22c55e" : "none" }} />
                        </div>
                    </motion.div>
                </div>
                <div className="flex justify-center mt-1"><div className="w-16 h-3 bg-[#333] rounded-t-sm" /></div>
                <div className="flex justify-center"><div className="w-28 h-2 bg-[#2a2a3a] rounded-b-lg" /></div>
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
                                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-[#F9DC34]">Available Commands:</h2>
                                <div className="space-y-1 mb-6">
                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/increase brightness</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Turn up the screen brightness.</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/decrease brightness</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Turn down the screen brightness.</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/look</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Look carefully at the screen.</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/enter</span> <span className="text-blue-600 dark:text-blue-300">[word]</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Enter the password.</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/reset</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Reset the level.</p>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-[#F9DC34]">Hint:</h3>
                                <p className="text-gray-600 dark:text-gray-300 italic">The darkness is a lie; summon the sun to reveal the truth.</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/30 px-6 py-4 text-center">
                                <button onClick={() => setHelpModalOpen(false)} className="bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] px-6 py-2 rounded-lg text-gray-900 font-medium shadow-md transition-transform hover:scale-105">Close</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Level19;
