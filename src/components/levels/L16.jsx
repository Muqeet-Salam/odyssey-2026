"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { ArrowRight } from "lucide-react";

const CORRECT_ANSWERS = ["hollywood sign", "the hollywood sign", "hollywood"];

const Level16 = ({ onComplete }) => {
    const [inputValue, setInputValue] = useState("");
    const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
    const [isHelpModalOpen, setHelpModalOpen] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [located, setLocated] = useState(false);
    const [hintUsed, setHintUsed] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isSuccess) {
            toast({
                title: "Landmark Identified! 🏔️",
                description: "The Hollywood Sign — Los Angeles, California!",
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

        const locateMatch = cmd.match(/^\/locate\s+([\d.\-]+)\s+([\d.\-]+)$/i);
        const submitMatch = cmd.match(/^\/submit\s+(.+)$/i);
        const hintMatch = cmd.match(/^\/hint$/i);
        const resetMatch = cmd.match(/^\/reset$/i);
        const helpMatch = cmd.match(/^\/help$/i);

        if (locateMatch) {
            const lat = parseFloat(locateMatch[1]);
            const lon = parseFloat(locateMatch[2]);
            // Accept if within ~0.01 degree of the Hollywood Sign coordinates (34.0907, -118.3266)
            if (Math.abs(lat - 34.0907) < 0.1 && Math.abs(lon + 118.3266) < 0.1) {
                setLocated(true);
                toast({
                    title: "📍 Location traced!",
                    description: "Coordinates match! Visual data recovered.",
                    variant: "default",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
                });
            } else {
                toast({
                    title: "❌ No match",
                    description: "Those coordinates don't match the signal. Try different values.",
                    variant: "destructive",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
                });
            }
        } else if (submitMatch) {
            const guess = submitMatch[1].trim().toLowerCase();
            if (CORRECT_ANSWERS.includes(guess)) {
                setIsSuccess(true);
            } else {
                toast({
                    title: "Incorrect ❌",
                    description: `"${submitMatch[1].trim()}" is not the landmark. Use the coordinates and image.`,
                    variant: "destructive",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
                });
            }
        } else if (hintMatch) {
            setHintUsed(true);
            toast({
                title: "Hint 💡",
                description: "This famous landmark sits on a hillside in Los Angeles and is made of giant white letters.",
                variant: "default",
                className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
            });
        } else if (resetMatch) {
            setLocated(false);
            setHintUsed(false);
            setIsSuccess(false);
            toast({
                title: "Level Reset",
                description: "Transmission data restored.",
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

    return (
        <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="px-6 py-3 text-2xl font-bold text-[#1A1A1A] dark:text-[#111111] bg-gradient-to-r from-[#F9DC34] to-[#F5A623] rounded-full shadow-lg"
            >
                Level 16
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8 text-xl font-semibold mb-4 text-center text-gray-900 dark:text-[#F9DC34]"
            >
                The Landmark Trace — I wonder where this leads...
            </motion.p>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full max-w-md"
            >
                <div className="bg-white dark:bg-[#1A1A1A]/40 rounded-2xl p-6 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700/30">
                    <div className="bg-[#1a1a2e] rounded-xl overflow-hidden shadow-inner border border-gray-800">
                        {/* Terminal bar */}
                        <div className="flex items-center justify-between bg-[#111] px-3 py-2 border-b border-[#222]">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#F9DC34]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">GPS Terminal</span>
                            <span className="text-[10px] text-[#ef4444] font-mono animate-pulse">● LIVE</span>
                        </div>

                        {/* Terminal content */}
                        <div className="p-5 font-mono text-sm bg-[#0a0a12]">
                            <p className="text-[#4ADE80] text-[10px] mb-4 tracking-tighter uppercase">▸ Initializing signal scan...</p>

                            <div className="border border-gray-800 rounded-lg p-4 mb-4 bg-[#0d0d1a]">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[#ef4444] animate-pulse">📡</span>
                                    <span className="text-gray-500 text-[10px] uppercase">Status: ENCRYPTED_STREAM</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-600 text-[10px] w-12 uppercase">Latitude</span>
                                        <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-[#F9DC34] text-lg font-bold tracking-widest font-mono">
                                            34.0907
                                        </motion.span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-600 text-[10px] w-12 uppercase">Longitude</span>
                                        <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }} className="text-[#F9DC34] text-lg font-bold tracking-widest font-mono">
                                            -118.3266
                                        </motion.span>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {located ? (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                        <p className="text-[#4ADE80] text-[10px] mb-3 uppercase tracking-tighter">▸ Visual data stream established</p>
                                        <div className="overflow-hidden rounded-lg border border-gray-800">
                                            <Image
                                                src="/hollywood.jpg"
                                                alt="Hollywood Sign"
                                                width={1200}
                                                height={800}
                                                className="h-auto w-full object-cover"
                                                priority
                                            />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <p className="text-gray-600 text-[10px] uppercase leading-relaxed">
                                        ▸ Enter coordinates to clarify stream...<br />
                                        ▸ Hint: City of Angels
                                    </p>
                                )}
                            </AnimatePresence>

                            {hintUsed && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 rounded bg-yellow-500/10 border border-yellow-500/20">
                                    <p className="text-[#F9DC34] text-[10px] leading-relaxed">
                                        💡 The landmark consists of giant white letters on a hillside in Los Angeles.
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
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
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/locate</span> <span className="text-blue-600 dark:text-blue-300">[lat] [lon]</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Trace GPS coordinates (e.g., /locate 34.0907 -118.3266)</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/submit</span> <span className="text-blue-600 dark:text-blue-300">[name]</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Submit identified landmark name.</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/hint</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Unlock a tactical hint.</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/reset</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Re-initialize terminal.</p>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-[#F9DC34]">Hint:</h3>
                                <p className="text-gray-600 dark:text-gray-300 italic">The city of angels holds a famous sign on its hills.</p>
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

export default Level16;
