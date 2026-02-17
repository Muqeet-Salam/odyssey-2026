"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { Thermometer, Lightbulb } from "lucide-react";

const Level22 = ({ onComplete }) => {
    const [inputValue, setInputValue] = useState("");
    const { pushCommand, handleKeyDown: handleHistoryKeys } = useCommandHistory(setInputValue);
    const [isHelpModalOpen, setHelpModalOpen] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Game State
    const [switches, setSwitches] = useState({ A: false, B: false, C: false });
    const [roomEntered, setRoomEntered] = useState(false);
    const [bulbTemp, setBulbTemp] = useState(0); // 0 to 100
    const [targetSwitch, setTargetSwitch] = useState(null);

    const { toast } = useToast();

    // Initialize random target switch
    useEffect(() => {
        const targets = ["A", "B", "C"];
        const randomTarget = targets[Math.floor(Math.random() * targets.length)];
        setTargetSwitch(randomTarget);
        console.log("Target Switch (Debug):", randomTarget);
    }, []);



    useEffect(() => {
        if (isSuccess) {
            toast({
                title: "Correct Switch Identified! 💡",
                description: "Logic prevails. Access granted.",
                variant: "success",
            });
            setTimeout(() => {
                onComplete();
            }, 2000);
        }
    }, [isSuccess, onComplete, toast]);

    const addLog = (msg) => {
        if (msg.includes("[LOCKED]") || msg.includes("Invalid")) {
            toast({
                title: "Action Failed",
                description: msg.replace(/^> /, ""),
                variant: "destructive"
            });
        } else if (msg.includes("Waiting")) {
            toast({
                title: "Time Passing...",
                description: msg.replace(/^> /, ""),
            });
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleEnter = (e) => {
        if (e.key === "Enter") {
            handleCommandSubmit();
        }
    };

    const handleCommandSubmit = () => {
        if (!inputValue.trim()) return;

        const cmd = inputValue.trim();
        pushCommand(cmd);

        // Command parsing
        const lowerCmd = cmd.toLowerCase();

        if (lowerCmd === "/help") {
            setHelpModalOpen(true);
        } else if (lowerCmd.startsWith("/flip ")) {
            handleFlip(lowerCmd.split(" ")[1]);
        } else if (lowerCmd.startsWith("/wait ")) {
            handleWait(lowerCmd.split(" ")[1]);
        } else if (lowerCmd === "/enter_room") {
            handleEnterRoom();
        } else if (lowerCmd.startsWith("/submit ")) {
            handleSubmit(lowerCmd.split(" ")[1]);
        } else {
            addLog(`> Unknown command: ${cmd}`);
            toast({
                title: "Unknown Command",
                description: "Type /help for valid commands.",
                variant: "destructive",
            });
        }

        setInputValue("");
    };

    const handleFlip = (switchName) => {
        if (roomEntered) {
            addLog("> [LOCKED] Cannot flip switches after entering the room.");
            return;
        }

        const s = switchName?.toUpperCase();
        if (!["A", "B", "C"].includes(s)) {
            addLog("> Invalid switch. Use A, B, or C.");
            return;
        }

        setSwitches(prev => {
            const newState = { ...prev, [s]: !prev[s] };
            addLog(`> Switch ${s} turned ${newState[s] ? "ON" : "OFF"}.`);
            return newState;
        });
    };

    const handleWait = (minutesStr) => {
        if (roomEntered) {
            addLog("> [LOCKED] Cannot wait. You are in the room.");
            return;
        }

        const minutes = parseInt(minutesStr);
        if (isNaN(minutes) || minutes <= 0) {
            addLog("> Invalid time. Usage: /wait [minutes]");
            return;
        }

        addLog(`> Waiting for ${minutes} minute(s)...`);

        // Calculate temp change
        // Logic: 
        // If target switch is ON: Temp increases
        // If target switch is OFF: Temp decreases (cools down)

        let tempChange = 0;
        const isTargetOn = switches[targetSwitch];

        if (isTargetOn) {
            // Heating up: +10 per minute
            tempChange = minutes * 10;
        } else {
            // Cooling down: -5 per minute
            tempChange = -(minutes * 5);
        }

        setBulbTemp(prev => {
            let newTemp = prev + tempChange;
            // Clamp between 0 and 100
            if (newTemp > 100) newTemp = 100;
            if (newTemp < 0) newTemp = 0;
            return newTemp;
        });
    };

    const handleEnterRoom = () => {
        if (roomEntered) {
            addLog("> You are already inside the room.");
            return;
        }
        setRoomEntered(true);
        addLog("> You open the steel door and step inside.");
        addLog("> The door locks behind you. Switches are no longer accessible.");

        // Check bulb state immediately for feedback
        const isLightOn = switches[targetSwitch];
        if (isLightOn) {
            addLog("> The room is brightly LIT.");
        } else {
            addLog("> The room is DARK.");
        }

        // Thermal feedback
        if (bulbTemp > 50) {
            addLog("> You feel RADIATING HEAT from the bulb.");
        } else if (bulbTemp > 20) {
            addLog("> The bulb is WARM to the touch.");
        } else {
            addLog("> The bulb is COLD.");
        }
    };

    const handleSubmit = (answer) => {
        if (!roomEntered) {
            addLog("> You must enter the room before submitting your answer.");
            return;
        }

        const ans = answer?.toUpperCase();
        if (!["A", "B", "C"].includes(ans)) {
            addLog("> Invalid answer. Usage: /submit [A|B|C]");
            return;
        }

        if (ans === targetSwitch) {
            addLog(`> CORRECT. Switch ${ans} controls the bulb.`);
            setIsSuccess(true);
        } else {
            addLog(`> INCORRECT. Switch ${ans} is not the correct one.`);
            toast({
                title: "Wrong Answer ❌",
                description: "Logic flaw detected. Sequence failed.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4 w-full">
            {/* Main Content Area */}
            <div className="w-full max-w-2xl mb-6 flex flex-col gap-6">
                {/* Visuals Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 shadow-xl flex flex-col items-center justify-center min-h-[300px]"
                >
                    {!roomEntered ? (
                        <div className="w-full flex flex-col items-center">
                            <h3 className="text-[#F9DC34] text-lg font-mono mb-8 tracking-widest uppercase">Hallway Control Panel</h3>
                            <div className="flex gap-12 mb-8">
                                {["A", "B", "C"].map(label => (
                                    <div key={label} className="flex flex-col items-center gap-3">
                                        <div className={`w-16 h-24 rounded-lg border-4 transition-all duration-300 relative shadow-inner ${switches[label] ? "bg-[#F9DC34] border-[#F9DC34] shadow-[0_0_20px_#F9DC34]" : "bg-gray-800 border-gray-600"}`}>
                                            <div className={`absolute w-full h-1/2 bg-black/20 ${switches[label] ? "bottom-0" : "top-0"}`} />
                                        </div>
                                        <span className="text-gray-400 font-bold font-mono text-xl">{label}</span>
                                        <span className={`text-sm font-bold ${switches[label] ? "text-[#F9DC34]" : "text-gray-600"}`}>{switches[label] ? "ON" : "OFF"}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center text-gray-500 text-sm italic border-t border-gray-700/50 pt-4 w-full">
                                Switches can only be flipped here. Entering the room locks them.
                            </div>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center">
                            <h3 className="text-[#F9DC34] text-lg font-mono mb-6 tracking-widest uppercase">Inside The Room</h3>

                            {/* Bulb Visual */}
                            <div className="relative mb-10">
                                <Lightbulb
                                    size={100}
                                    className={`transition-all duration-500 ${switches[targetSwitch] ? "text-[#F9DC34] fill-[#F9DC34] drop-shadow-[0_0_50px_#F9DC34]" : "text-gray-700"}`}
                                />
                                {bulbTemp > 30 && !switches[targetSwitch] && (
                                    <motion.div
                                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full scale-150"
                                    />
                                )}
                            </div>

                            {/* Feedback Indicators */}
                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="bg-black/40 p-4 rounded-lg border border-gray-800 flex items-center gap-4">
                                    <Lightbulb size={24} className={switches[targetSwitch] ? "text-[#F9DC34]" : "text-gray-500"} />
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Light Status</div>
                                        <div className={`text-base font-bold ${switches[targetSwitch] ? "text-[#F9DC34]" : "text-gray-400"}`}>
                                            {switches[targetSwitch] ? "ILLUMINATED" : "DARK"}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-black/40 p-4 rounded-lg border border-gray-800 flex items-center gap-4">
                                    <Thermometer size={24} className={bulbTemp > 50 ? "text-red-500" : bulbTemp > 20 ? "text-orange-400" : "text-blue-400"} />
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Thermal Scan</div>
                                        <div className={`text-base font-bold ${bulbTemp > 50 ? "text-red-500" : bulbTemp > 20 ? "text-orange-400" : "text-blue-400"}`}>
                                            {bulbTemp > 50 ? "HOT" : bulbTemp > 20 ? "WARM" : "COLD"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>



                {/* Command Panel */}
                <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto mt-2">
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
                        className="flex gap-2 w-full"
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
                                        /flip
                                    </span>{" "}
                                    <span className="text-blue-600 dark:text-blue-300">[A|B|C]</span>
                                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                                        Toggle a switch ON or OFF. (Hallway only)
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                    <span className="font-bold text-gray-700 dark:text-gray-300">
                                        /wait
                                    </span>{" "}
                                    <span className="text-blue-600 dark:text-blue-300">[minutes]</span>
                                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                                        Wait for time to pass. Affects bulb temperature.
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                    <span className="font-bold text-gray-700 dark:text-gray-300">
                                        /enter_room
                                    </span>
                                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                                        Lock switches and step inside to inspect the bulb.
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                                    <span className="font-bold text-gray-700 dark:text-gray-300">
                                        /submit
                                    </span>{" "}
                                    <span className="text-blue-600 dark:text-blue-300">[A|B|C]</span>
                                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                                        Identify which switch controls the bulb. (Room only)
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
                                How to solve:
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border-l-4 border-blue-500 mb-6">
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    You&apos;re standing in a hallway with 3 switches (A, B, C). One of them controls a light bulb in a sealed room.<br className="mb-2" />
                                    You can flip switches as many times as you want. But once you <span className="font-mono text-[#F5A623]">/enter_room</span>, the door LOCKS and you can&apos;t touch the switches.<br className="mb-2" />
                                    <strong>Your goal:</strong> figure out WHICH switch (A, B, or C) controls the bulb.<br className="mb-2" />
                                    <strong>Tip:</strong> The bulb gives off HEAT when it&apos;s been on. Use <span className="font-mono text-[#F5A623]">/wait</span> to let time pass. Then /enter_room and check if the bulb is lit, warm, or cold.
                                </p>
                            </div>

                            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-[#F9DC34]">
                                Hint:
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 italic">
                                Turn one switch ON and wait. Then turn it OFF, and turn a different switch ON.
                                Enter the room. If the bulb is lit, it's the switch you left ON.
                                If it's off but warm, it's the one you turned off. If it's cold, it's the third one.
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/30 px-6 py-4 text-center flex-shrink-0">
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
        </div>
    );
};

export default Level22;
