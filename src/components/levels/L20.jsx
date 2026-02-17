"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { ArrowRight } from "lucide-react";

const CORRECT_NAME = "rick astley";

const Level20 = ({ onComplete }) => {
    const [inputValue, setInputValue] = useState("");
    const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
    const [isHelpModalOpen, setHelpModalOpen] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [detailsViewed, setDetailsViewed] = useState(false);
    const [progress, setProgress] = useState(0);
    const progressRef = useRef(null);
    const audioRef = useRef(null);
    const { toast } = useToast();

    useEffect(() => {
        audioRef.current = new Audio("/rickroll.webm");
        audioRef.current.loop = true;
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (isSuccess) {
            toast({
                title: "Correct! 🎵",
                description: "Never gonna give you up! — Rick Astley, 1987",
                variant: "success",
                className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
            });
            setTimeout(() => {
                onComplete();
            }, 2000);
        }
    }, [isSuccess, onComplete, toast]);

    useEffect(() => {
        if (isPlaying) {
            progressRef.current = setInterval(() => {
                setProgress((p) => (p >= 100 ? 0 : p + 0.047));
            }, 100);
        } else {
            clearInterval(progressRef.current);
        }
        return () => clearInterval(progressRef.current);
    }, [isPlaying]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleEnter = (e) => {
        if (e.key === "Enter") {
            handleCommandSubmit();
        }
    };

    const formatTime = (pct) => {
        const totalSec = Math.floor((pct / 100) * 213);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${m}:${String(s).padStart(2, "0")}`;
    };

    const handleCommandSubmit = () => {
        pushCommand(inputValue);
        const cmd = inputValue.trim().toLowerCase();

        const playMatch = cmd.match(/^\/play$/i);
        const stopMatch = cmd.match(/^\/stop$/i);
        const viewMatch = cmd.match(/^\/view\s+details$/i);
        const enterMatch = cmd.match(/^\/enter\s+(.+)$/i);
        const resetMatch = cmd.match(/^\/reset$/i);
        const helpMatch = cmd.match(/^\/help$/i);

        if (playMatch) {
            if (isPlaying) {
                toast({
                    title: "Already playing 🎶",
                    description: "The music is already playing...",
                    variant: "default",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
                });
            } else {
                setIsPlaying(true);
                if (audioRef.current) {
                    audioRef.current.play().catch(() => { });
                }
                toast({
                    title: "▶ Now Playing",
                    description: "♪ Never Gonna Give You Up ♪",
                    variant: "default",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
                });
            }
        } else if (stopMatch) {
            if (!isPlaying) {
                toast({
                    title: "Already stopped ⏹",
                    description: "The music is not playing.",
                    variant: "default",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
                });
            } else {
                setIsPlaying(false);
                setProgress(0);
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                }
                toast({
                    title: "⏹ Stopped",
                    description: "Music stopped.",
                    variant: "default",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
                });
            }
        } else if (viewMatch) {
            setDetailsViewed(true);
            toast({
                title: "Track Details 📋",
                description: "Title: Never Gonna Give You Up\nArtist: R. Astley\nAlbum: Whenever You Need Somebody\nYear: 1987\nGenre: Pop/Dance",
                variant: "default",
                className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1A1A1A] opacity-100 shadow-lg",
            });
        } else if (enterMatch) {
            const guess = enterMatch[1].trim().toLowerCase();
            if (guess === CORRECT_NAME) {
                setIsSuccess(true);
            } else {
                toast({
                    title: "Wrong name ❌",
                    description: `"${enterMatch[1].trim()}" is not correct. Check the artist info.`,
                    variant: "destructive",
                    className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
                });
            }
        } else if (resetMatch) {
            setIsPlaying(false);
            setDetailsViewed(false);
            setProgress(0);
            setIsSuccess(false);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            toast({
                title: "Level Reset",
                description: "Music player restored.",
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
                Level 19
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8 text-xl font-semibold mb-4 text-center text-gray-900 dark:text-[#F9DC34]"
            >
                The Music Player — Enter the artist's full name.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full max-w-sm relative"
            >
                <div className="bg-white dark:bg-[#1A1A1A]/40 rounded-2xl p-6 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700/30">
                    <div className="flex justify-center mb-6">
                        <motion.div
                            animate={{ rotate: isPlaying ? 360 : 0 }}
                            transition={{ repeat: isPlaying ? Infinity : 0, duration: 4, ease: "linear" }}
                            className="relative shadow-2xl rounded-full"
                        >
                            <svg viewBox="0 0 120 120" className="w-32 h-32">
                                <circle cx="60" cy="60" r="58" fill="#111" />
                                {[20, 25, 33, 40, 48, 55].map((r, i) => (
                                    <circle key={i} cx="60" cy="60" r={r} fill="none" stroke="#222" strokeWidth="0.5" />
                                ))}
                                <circle cx="60" cy="60" r="18" fill="#e53935" />
                                <text x="60" y="56" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">
                                    {detailsViewed ? "R. ASTLEY" : "???"}
                                </text>
                                <text x="60" y="63" textAnchor="middle" fontSize="4" fill="#FFCDD2">
                                    {detailsViewed ? "Never Gonna" : "Track 01"}
                                </text>
                                <text x="60" y="69" textAnchor="middle" fontSize="4" fill="#FFCDD2">
                                    {detailsViewed ? "Give You Up" : ""}
                                </text>
                                <circle cx="60" cy="60" r="3" fill="#0d0d1a" />
                            </svg>
                        </motion.div>
                    </div>

                    <div className="text-center mb-6">
                        <h3 className="text-gray-900 dark:text-white text-lg font-bold tracking-wide">
                            {detailsViewed ? "Never Gonna Give You Up" : "Unknown Track"}
                        </h3>
                        <p className="text-gray-600 dark:text-purple-300 text-sm mt-1">
                            Artist: <span className="text-[#F5A623] dark:text-[#F9DC34] font-semibold">{detailsViewed ? "Rick Astley" : "???"}</span>
                        </p>
                    </div>

                    <div className="mb-6">
                        <div className="h-1.5 bg-gray-200 dark:bg-[#333] rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-[#F5A623] to-[#F9DC34]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-xs text-gray-500 font-mono">{formatTime(progress)}</span>
                            <span className="text-xs text-gray-500 font-mono">3:33</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-8">
                        <span className="text-gray-400 text-xl cursor-default opacity-50">⏮</span>
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            className="w-14 h-14 rounded-full bg-gradient-to-r from-[#F9DC34] to-[#F5A623] flex items-center justify-center shadow-lg cursor-default"
                        >
                            <span className="text-gray-900 text-2xl">
                                {isPlaying ? "⏸" : "▶"}
                            </span>
                        </motion.div>
                        <span className="text-gray-400 text-xl cursor-default opacity-50">⏭</span>
                    </div>

                    {detailsViewed && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 bg-gray-50 dark:bg-[#111122] rounded-xl p-4 border border-gray-100 dark:border-[#333]"
                        >
                            <p className="text-[10px] text-gray-400 font-bold mb-3 tracking-widest uppercase">Track Details</p>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Album:</span>
                                    <span className="text-gray-700 dark:text-gray-300">Whenever You Need Somebody</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Year:</span>
                                    <span className="text-gray-700 dark:text-gray-300">1987</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Genre:</span>
                                    <span className="text-gray-700 dark:text-gray-300">Pop / Dance</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
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
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/play</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Play the track.</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/stop</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Stop playback.</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/view details</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">View track information.</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/enter</span> <span className="text-blue-600 dark:text-blue-300">[name]</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Enter the artist's full name.</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">/reset</span>
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">Reset the level.</p>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-[#F9DC34]">Hint:</h3>
                                <p className="text-gray-600 dark:text-gray-300 italic">The song is a legacy; seek the labels to find the voice.</p>
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

export default Level20;
