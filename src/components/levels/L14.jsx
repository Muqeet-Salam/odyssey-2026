"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

const CORRECT_ANSWERS = ["hollywood sign", "the hollywood sign", "hollywood"];

const Level14 = ({ onComplete }) => {
    const [inputValue, setInputValue] = useState("");
    const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
    const [isHelpModalOpen, setHelpModalOpen] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [located, setLocated] = useState(false);
    const [hintUsed, setHintUsed] = useState(false);
    const [scanLevel, setScanLevel] = useState(0); // 0-3: progressive coordinate reveal
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();

    // Progressive coordinate fragments
    const getLatDisplay = () => {
        if (scanLevel === 0) return "??.????° ?";
        if (scanLevel === 1) return "3?.????° N";
        if (scanLevel === 2) return "34.1?°  N";
        return "34.1341° N";
    };
    const getLonDisplay = () => {
        if (scanLevel === 0) return "???.????° ?";
        if (scanLevel === 1) return "1??.????° W";
        if (scanLevel === 2) return "118.3?°  W";
        return "118.3215° W";
    };

    useEffect(() => {
        if (isSuccess) {
            toast({
                title: "Landmark Identified!",
                description: "The Hollywood Sign — Los Angeles, California!",
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
        const cmd = inputValue.trim();

        const scanMatch = cmd.match(/^\/scan$/i);
        const locateMatch = cmd.match(/^\/locate\s+([\d.\-]+)[\s,]+(-?[\d.]+)$/i);
        const submitMatch = cmd.match(/^\/submit\s+(.+)$/i);
        const hintMatch = cmd.match(/^\/hint$/i);
        const resetMatch = cmd.match(/^\/reset$/i);
        const helpMatch = cmd.match(/^\/help$/i);

        if (scanMatch) {
            if (scanLevel >= 3) {
                toast({
                    title: "Scan complete",
                    description: "Coordinates fully decoded. Use /locate to trace.",
                    variant: "default"
                });
            } else {
                const next = scanLevel + 1;
                setScanLevel(next);
                const messages = [
                    "Partial signal recovered... hemisphere detected.",
                    "Refining coordinates... region narrowed down.",
                    "Full coordinates decoded! Ready to locate."
                ];
                toast({
                    title: `📡 Scan ${next}/3`,
                    description: messages[next - 1],
                    variant: "default"
                });
            }
        } else if (locateMatch) {
            if (scanLevel < 3) {
                toast({
                    title: "Incomplete data",
                    description: `Coordinates not fully decoded yet. Use /scan (${3 - scanLevel} more needed).`,
                    variant: "destructive"
                });
            } else {
                const lat = parseFloat(locateMatch[1]);
                const lon = parseFloat(locateMatch[2]);
                // Accept if within ~0.05 degree of the Hollywood Sign coordinates
                if (Math.abs(lat - 34.1341) < 0.05 && Math.abs(Math.abs(lon) - 118.3215) < 0.05) {
                    setLocated(true);
                    toast({
                        title: "Location traced!",
                        description: "Coordinates match! Visual data recovered.",
                        variant: "default"
                    });
                } else {
                    toast({
                        title: "❌ No match",
                        description: "Those coordinates don't match the signal. Check the decoded values.",
                        variant: "destructive"
                    });
                }
            }
        } else if (submitMatch) {
            const guess = submitMatch[1].trim().toLowerCase();
            if (CORRECT_ANSWERS.includes(guess)) {
                setIsSuccess(true);
            } else {
                toast({
                    title: "Incorrect ❌",
                    description: `"${submitMatch[1].trim()}" is not the landmark. Look at the image carefully.`,
                    variant: "destructive"
                });
            }
        } else if (hintMatch) {
            setHintUsed(true);
            toast({
                title: "Hint 💡",
                description: "This famous landmark sits on a hillside in Los Angeles and is made of giant white letters.",
                variant: "default"
            });
        } else if (resetMatch) {
            setLocated(false);
            setHintUsed(false);
            setScanLevel(0);
            setIsSuccess(false);
            toast({
                title: "Level Reset",
                description: "Transmission data restored.",
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

    return (
        <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">

            {/* Question */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8 text-xl font-semibold mb-4 text-center text-gray-900 dark:text-[#F9DC34]"
            >
                The Landmark Trace — I wonder where this leads...
            </motion.p>

            {/* Terminal / GPS Display */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full max-w-md"
            >
                <div className="bg-[#1a1a2e] rounded-xl p-3 border border-[#333] shadow-lg">
                    {/* Terminal bar */}
                    <div className="flex items-center justify-between bg-[#111] rounded-t-lg px-3 py-1.5 border-b border-[#222]">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#F9DC34]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                        </div>
                        <span className="text-[10px] text-[#555] font-mono">GPS RECOVERY TERMINAL</span>
                        <span className="text-[10px] text-[#ef4444] font-mono animate-pulse">● LIVE</span>
                    </div>

                    {/* Terminal content */}
                    <div className="bg-[#0a0a12] rounded-b-lg p-4 font-mono text-sm">
                        {/* Header */}
                        <p className="text-[#4ADE80] text-xs mb-3">
                            ▸ RECOVERED GPS TRANSMISSION
                        </p>
                        <div className="border border-[#333] rounded-lg p-4 mb-3 bg-[#0d0d1a]">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[#ef4444] animate-pulse">📡</span>
                                <span className="text-gray-500 text-xs">Signal Status: DECODED</span>
                            </div>

                            {/* Progressive coordinate display */}
                            <div className="space-y-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-gray-500 text-xs w-10">LAT:</span>
                                    <motion.span
                                        key={`lat-${scanLevel}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className={`text-lg font-bold tracking-wider ${scanLevel >= 3 ? "text-[#4ADE80]" : "text-[#F9DC34]"}`}
                                    >
                                        {getLatDisplay()}
                                    </motion.span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-gray-500 text-xs w-10">LON:</span>
                                    <motion.span
                                        key={`lon-${scanLevel}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className={`text-lg font-bold tracking-wider ${scanLevel >= 3 ? "text-[#4ADE80]" : "text-[#F9DC34]"}`}
                                    >
                                        {getLonDisplay()}
                                    </motion.span>
                                </div>
                                {scanLevel < 3 && (
                                    <p className="text-gray-600 text-[10px] mt-1">
                                        Signal strength: {Math.round((scanLevel / 3) * 100)}% — Use /scan to decode
                                    </p>
                                )}
                                {scanLevel >= 3 && !located && (
                                    <p className="text-[#4ADE80] text-[10px] mt-1">
                                        ✓ Coordinates decoded — Use /locate to trace
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Locate instruction */}
                        {!located && scanLevel >= 3 && (
                            <p className="text-gray-500 text-xs">
                                Use <span className="text-gray-400">/locate 34.1341 -118.3215</span> to trace the signal.
                            </p>
                        )}
                        {!located && scanLevel < 3 && (
                            <p className="text-gray-500 text-xs">
                                Use <span className="text-gray-400">/scan</span> to decode the GPS signal. ({3 - scanLevel} scans remaining)
                            </p>
                        )}

                        {/* Image area (shown after /locate) */}
                        {located && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <p className="text-[#4ADE80] text-xs mb-2">▸ VISUAL DATA RECOVERED</p>
                                <div className="border border-[#333] rounded-lg overflow-hidden bg-[#0d0d1a]">
                                    <Image
                                        src="/hwood.jpeg"
                                        alt="Hollywood Sign"
                                        width={760}
                                        height={360}
                                        className="w-full h-auto"
                                    />
                                </div>
                                <p className="text-gray-500 text-xs mt-2">
                                    Use <span className="text-gray-400">/submit [landmark name]</span> to identify it.
                                </p>
                            </motion.div>
                        )}

                        {/* Hint display */}
                        {hintUsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-3 bg-[#1a1a2e] border border-[#F9DC34]/30 rounded p-2"
                            >
                                <p className="text-[#F9DC34] text-xs">
                                    This famous landmark sits on a hillside in Los Angeles and is made of giant white letters.
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>



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
                                        /scan
                                    </span>
                                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                                        Decode the GPS signal. Run 3 times to fully reveal coordinates.
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                    <span className="font-bold text-gray-700 dark:text-gray-300">
                                        /locate
                                    </span>{" "}
                                    <span className="text-blue-600 dark:text-blue-300">[lat] [lon]</span>
                                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                                        Trace the GPS signal with decoded coordinates to retrieve visual data.
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                    <span className="font-bold text-gray-700 dark:text-gray-300">
                                        /submit
                                    </span>{" "}
                                    <span className="text-blue-600 dark:text-blue-300">[landmark name]</span>
                                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                                        Submit the name of the identified landmark.
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                    <span className="font-bold text-gray-700 dark:text-gray-300">
                                        /hint
                                    </span>
                                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                                        Get a hint about the landmark.
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                    <span className="font-bold text-gray-700 dark:text-gray-300">
                                        /reset
                                    </span>
                                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                                        Reset the level.
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
                                How to Play:
                            </h3>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                <li>Use <strong>/scan</strong> three times to decode the GPS coordinates</li>
                                <li>Use <strong>/locate</strong> with the decoded coordinates to recover imagery</li>
                                <li>Identify the landmark and <strong>/submit</strong> its name</li>
                            </ul>

                            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-[#F9DC34]">
                                Hint:
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 italic">
                                The map leads to the city of angels; look for the white letters on the hill.
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

export default Level14;