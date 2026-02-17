"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

const CORRECT_NAME = "rick astley";

const Level13 = ({ onComplete }) => {
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
    const { theme, setTheme } = useTheme();

    // Initialize audio on mount
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
                title: "Correct!",
                description: "Never gonna give you up! Rick Astley, 1987",
                variant: "success"
            });
            setTimeout(() => {
                onComplete(4);
            }, 2000);
        }
    }, [isSuccess, onComplete, toast]);

    // Progress bar animation when playing
    useEffect(() => {
        if (isPlaying) {
            progressRef.current = setInterval(() => {
                setProgress((p) => (p >= 100 ? 0 : p + 0.5));
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
        const totalSec = Math.floor((pct / 100) * 213); // 3:33 song length
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
                    variant: "default"
                });
            } else {
                setIsPlaying(true);
                if (audioRef.current) {
                    audioRef.current.play().catch(() => { });
                }
                toast({
                    title: "▶ Now Playing",
                    description: "♪ Never Gonna Give You Up ♪",
                    variant: "default"
                });
            }
        } else if (stopMatch) {
            if (!isPlaying) {
                toast({
                    title: "Already stopped ⏹",
                    description: "The music is not playing.",
                    variant: "default"
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
                    variant: "default"
                });
            }
        } else if (viewMatch) {
            setDetailsViewed(true);
            toast({
                title: "Track Details 📋",
                description: "Title: Never Gonna Give You Up\nArtist: R. Astley\nAlbum: Whenever You Need Somebody\nYear: 1987\nGenre: Pop/Dance",
                variant: "default"
            });
        } else if (enterMatch) {
            const guess = enterMatch[1].trim().toLowerCase();
            if (guess === CORRECT_NAME) {
                setIsSuccess(true);
            } else {
                toast({
                    title: "Wrong name ❌",
                    description: `"${enterMatch[1].trim()}" is not correct. Check the artist info.`,
                    variant: "destructive"
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
                The Music Player — Enter the artist's full name.
            </motion.p>

            {/* Music Player */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full max-w-sm relative"
            >
                <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0d0d1a] rounded-2xl p-5 shadow-2xl border border-gray-700/30">
                    {/* Album art area */}
                    <div className="flex justify-center mb-4">
                        <motion.div
                            animate={{ rotate: isPlaying ? 360 : 0 }}
                            transition={{ repeat: isPlaying ? Infinity : 0, duration: 3, ease: "linear" }}
                            className="relative"
                        >
                            {/* Vinyl record */}
                            <svg viewBox="0 0 120 120" className="w-28 h-28">
                                <circle cx="60" cy="60" r="58" fill="#111" stroke="#333" strokeWidth="1" />
                                <circle cx="60" cy="60" r="52" fill="none" stroke="#222" strokeWidth="0.5" />
                                <circle cx="60" cy="60" r="45" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
                                <circle cx="60" cy="60" r="38" fill="none" stroke="#222" strokeWidth="0.5" />
                                <circle cx="60" cy="60" r="30" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
                                {/* Grooves */}
                                {[20, 25, 33, 40, 48, 55].map((r, i) => (
                                    <circle key={i} cx="60" cy="60" r={r} fill="none" stroke="#1f1f2f" strokeWidth="0.3" />
                                ))}
                                {/* Label */}
                                <circle cx="60" cy="60" r="18" fill="#e53935" />
                                <circle cx="60" cy="60" r="16" fill="#c62828" />
                                <text x="60" y="56" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">
                                    {detailsViewed ? "R. ASTLEY" : "???"}
                                </text>
                                <text x="60" y="63" textAnchor="middle" fontSize="4" fill="#FFCDD2">
                                    {detailsViewed ? "Never Gonna" : "Track 01"}
                                </text>
                                <text x="60" y="69" textAnchor="middle" fontSize="4" fill="#FFCDD2">
                                    {detailsViewed ? "Give You Up" : ""}
                                </text>
                                {/* Center hole */}
                                <circle cx="60" cy="60" r="3" fill="#0d0d1a" />
                            </svg>
                        </motion.div>
                    </div>

                    {/* Track info — only shown after /view details */}
                    <div className="text-center mb-3">
                        <h3 className="text-white text-lg font-bold tracking-wide">
                            {detailsViewed ? "Never Gonna Give You Up" : "Unknown Track"}
                        </h3>
                        <p className="text-gray-300 text-sm mt-1">
                            Artist: <span className="text-[#F9DC34] font-semibold">{detailsViewed ? "R. Astley" : "???"}</span>
                        </p>
                        {detailsViewed && (
                            <p className="text-gray-500 text-xs mt-0.5">
                                1987 • Whenever You Need Somebody
                            </p>
                        )}
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                        <div className="h-1 bg-[#333] rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-[#F5A623] to-[#F9DC34]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-500 font-mono">{formatTime(progress)}</span>
                            <span className="text-xs text-gray-500 font-mono">3:33</span>
                        </div>
                    </div>

                    {/* Playback controls (visual only) */}
                    <div className="flex items-center justify-center gap-6 mb-4">
                        <span className="text-gray-500 text-lg cursor-default">⏮</span>
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            className="w-12 h-12 rounded-full bg-gradient-to-r from-[#F9DC34] to-[#F5A623] flex items-center justify-center shadow-lg cursor-default"
                        >
                            <span className="text-gray-900 text-xl font-bold">
                                {isPlaying ? "⏸" : "▶"}
                            </span>
                        </motion.div>
                        <span className="text-gray-500 text-lg cursor-default">⏭</span>
                    </div>



                    {/* Details panel (shown after /view details) */}
                    {detailsViewed && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 bg-[#111122] rounded-lg p-3 border border-[#333]"
                        >
                            <p className="text-xs text-gray-400 font-bold mb-2">TRACK DETAILS</p>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Title:</span>
                                    <span className="text-gray-300">Never Gonna Give You Up</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Artist:</span>
                                    <span className="text-[#F9DC34] font-semibold">R. Astley</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Album:</span>
                                    <span className="text-gray-300">Whenever You Need Somebody</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Year:</span>
                                    <span className="text-gray-300">1987</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Genre:</span>
                                    <span className="text-gray-300">Pop / Dance</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Prompt */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-4 text-sm text-center text-gray-300 italic"
            >
                "Enter the artist's full name."
            </motion.p>

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
                                        /play
                                    </span>
                                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                                        Play the track.
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                    <span className="font-bold text-gray-700 dark:text-gray-300">
                                        /stop
                                    </span>
                                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                                        Stop the track.
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                    <span className="font-bold text-gray-700 dark:text-gray-300">
                                        /view details
                                    </span>
                                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                                        View full track details (title, artist, album, year).
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                    <span className="font-bold text-gray-700 dark:text-gray-300">
                                        /enter
                                    </span>{" "}
                                    <span className="text-blue-600 dark:text-blue-300">[name]</span>
                                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                                        Enter the artist's full name.
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
                                Hint:
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 italic">
                                The song is a legacy; seek the labels to find the voice.
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

export default Level13;