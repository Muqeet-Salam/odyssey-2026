"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { ArrowRight, Thermometer, Lightbulb } from "lucide-react";

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
    const [gameLog, setGameLog] = useState(["System initialized.", "You are in the hallway.", "Switches A, B, and C are visible."]);

    const { toast } = useToast();
    const logEndRef = useRef(null);

    // Initialize random target switch
    useEffect(() => {
        const targets = ["A", "B", "C"];
        const randomTarget = targets[Math.floor(Math.random() * targets.length)];
        setTargetSwitch(randomTarget);
        console.log("Target Switch (Debug):", randomTarget);
    }, []);

    // Auto-scroll log
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [gameLog]);

    useEffect(() => {
        if (isSuccess) {
            toast({
                title: "Correct Switch Identified! 💡",
                description: "Logic prevails. Access granted.",
                variant: "success",
                className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
            });
            setTimeout(() => {
                onComplete();
            }, 2000);
        }
    }, [isSuccess, onComplete, toast]);

    const addLog = (msg) => {
        setGameLog(prev => [...prev, msg]);
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
                className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
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
                className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
            });
        }
    };

    return (
        <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4 w-full">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-3 text-2xl font-bold text-[#1A1A1A] dark:text-[#111111] bg-gradient-to-r from-[#F9DC34] to-[#F5A623] rounded-full shadow-lg mb-8"
            >
                Level 22
            </motion.h1>

            {/* Main Content Area */}
            <div className="w-full max-w-2xl mb-24 flex flex-col gap-6">
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

                {/* Game Log */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col max-h-[200px] w-full"
                >
                    <div className="bg-black/40 rounded-xl border border-gray-700/30 p-4 overflow-y-auto font-mono text-sm shadow-inner min-h-[100px]">
                        {gameLog.map((log, i) => (
                            <div key={i} className={`mb-1.5 ${log.startsWith("> ALERT") ? "text-red-400" : log.startsWith("> CORRECT") ? "text-green-400" : "text-gray-300"}`}>
                                {log}
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </motion.div>
            </div>

            {/* Sticky Command Input */}
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-700/50 bg-[#111111]/90 backdrop-blur-md py-4">
                <div className="max-w-4xl mx-auto px-4 w-full flex flex-col items-center gap-2">
                    <p
                        className="text-gray-500 hover:text-[#F9DC34] cursor-pointer transition-colors text-xs mb-1"
                        onClick={() => setHelpModalOpen(true)}
                    >
                        Type <span className="font-mono bg-gray-800 px-1 rounded">/help</span> for commands
                    </p>
                    <div className="flex gap-2 w-full max-w-xl">
                        <Input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={(e) => { handleEnter(e); handleHistoryKeys(e); }}
                            placeholder="Enter command (e.g., /flip A)..."
                            autoFocus
                            className="bg-black/50 border-gray-700 focus:border-[#F9DC34] text-gray-200 font-mono shadow-inner h-12 text-lg"
                        />
                        <button
                            onClick={handleCommandSubmit}
                            className="bg-[#F9DC34] hover:bg-[#FFE55C] text-black px-4 rounded-lg transition-colors shadow-lg font-bold"
                        >
                            <ArrowRight size={24} />
                        </button>
                    </div>
                </div>
            </div>


            {/* Help Modal */}
            <AnimatePresence>
                {isHelpModalOpen && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1A1A1A] border border-gray-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl"
                        >
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-[#F9DC34] mb-4">Command Reference</h2>
                                <div className="space-y-3 font-mono text-sm text-gray-300">
                                    <div className="bg-black/30 p-2 rounded">
                                        <span className="text-[#F9DC34]">/flip [A/B/C]</span>
                                        <p className="text-gray-500 text-xs mt-1">Toggle a switch. (Hallway only)</p>
                                    </div>
                                    <div className="bg-black/30 p-2 rounded">
                                        <span className="text-[#F9DC34]">/wait [minutes]</span>
                                        <p className="text-gray-500 text-xs mt-1">Wait for time to pass. Affects bulb temperature.</p>
                                    </div>
                                    <div className="bg-black/30 p-2 rounded">
                                        <span className="text-[#F9DC34]">/enter_room</span>
                                        <p className="text-gray-500 text-xs mt-1">Lock switches and inspect the bulb.</p>
                                    </div>
                                    <div className="bg-black/30 p-2 rounded">
                                        <span className="text-[#F9DC34]">/submit [A/B/C]</span>
                                        <p className="text-gray-500 text-xs mt-1">Identify the controlling switch.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-black/50 p-4 flex justify-center border-t border-gray-800">
                                <button
                                    onClick={() => setHelpModalOpen(false)}
                                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
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

export default Level22;
