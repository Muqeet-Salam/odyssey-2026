"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { database } from "../../firebase";
import { off, onValue, ref, set } from "firebase/database";
import { convertDotsToUnderscores } from "@/lib/utils";
import { staticData } from "@/lib/staticdata";
import { motion } from "framer-motion";

// Floating particle component
const Particle = ({ delay, duration, x, size }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size,
      height: size,
      left: `${x}%`,
      bottom: -20,
      background: `radial-gradient(circle, rgba(249,220,52,${0.15 + Math.random() * 0.2}) 0%, transparent 70%)`,
    }}
    animate={{
      y: [0, -window?.innerHeight || -800],
      x: [0, (Math.random() - 0.5) * 120],
      opacity: [0, 0.8, 0.6, 0],
      scale: [0.5, 1.2, 0.8, 0.3],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeOut",
    }}
  />
);

// Grid node that pulses
const GridNode = ({ x, y, delay }) => (
  <motion.circle
    cx={x}
    cy={y}
    r="1.5"
    fill="#F9DC34"
    initial={{ opacity: 0.05 }}
    animate={{ opacity: [0.05, 0.35, 0.05] }}
    transition={{ duration: 3, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

const Home = () => {
  const { data: session } = useSession();
  const [userDet, setUserDet] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const getUserId = () => {
    if (!session || !session.user) return null;
    
    const userId = 
      session.user.id || 
      session.user.uid || 
      session.user.userId || 
      (session.user.email ? convertDotsToUnderscores(session.user.email) : null);
    
    if (!userId) {
      console.error("Could not determine user ID from session:", session.user);
      return null;
    }
    
    return userId;
  };
  
  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      const dbPath = `/odysseyParticipants/${userId}`;
      
      const userRef = ref(database, dbPath);
      onValue(userRef, (snapshot) => {
        setLoading(false);
        const userVal = snapshot.val();
        if (userVal) {
          setUserDet(userVal);
        } else {
          console.log("No user data found, creating default entry");
          set(userRef, { CL: 1, CS: 0, S: 0 }).then(() => {
            setUserDet({ CL: 1, CS: 0, S: 0 });
            console.log("Default user data created");
          }).catch(error => {
            console.error("Error creating default user data:", error);
          });
        }
      }, (error) => {
        setLoading(false);
        console.error("Firebase onValue error:", error);
      });
      
      return () => {
        off(userRef);
      };
    } else {
      setLoading(false);
      console.log("No session or user, cannot fetch userDet");
    }
  }, [session]);
  
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#1A1A1A] to-[#111111] overflow-hidden relative">

      {/* Animated grid background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F9DC34" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Pulsing nodes at grid intersections */}
          {Array.from({ length: 12 }).map((_, i) => (
            <GridNode
              key={i}
              x={40 * (1 + (i % 4) * 3)}
              y={40 * (1 + Math.floor(i / 4) * 4)}
              delay={i * 0.4}
            />
          ))}
        </svg>
      </div>

      {/* Radial gold glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(249,220,52,0.06) 0%, rgba(245,166,35,0.03) 30%, transparent 70%)",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 225 }).map((_, i) => (
          <Particle
            key={i}
            delay={i * 0.1}
            duration={5 + Math.random() * 7}
            x={2 + (i / 45) * 96}
            size={2 + Math.random() * 5}
          />
        ))}
      </div>
      
      <div className="z-10 w-full max-w-md px-6 py-12 flex flex-col items-center">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Image
            src="/DarkVertical.png"
            alt="logo"
            width={300}
            height={300}
            className="drop-shadow-lg"
          />
        </motion.div>
        
        {loading ? (
          <div className="flex justify-center items-center mt-8">
            <div className="w-12 h-12 rounded-full border-4 border-t-[#F9DC34] border-gray-700 animate-spin"></div>
          </div>
        ) : session ? (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full flex flex-col items-center"
          >
            <div className="backdrop-blur-md bg-white/5 rounded-xl p-6 shadow-lg border border-gray-300/20 w-full">
              {userDet?.CL <= staticData.maxLevel ? (
                <Link href="/game" className="w-full flex justify-center">
                  <Button 
                    className="w-full py-6 text-xl font-bold bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] text-gray-900 rounded-lg shadow-lg transform transition-transform hover:scale-105"
                  >
                    Play Level {userDet?.CL || 1}
                  </Button>
                </Link>
              ) : (
                <div className="text-center py-6 text-xl font-semibold text-[#F9DC34]">
                  {userDet?.CL > 15 ? (
                    <span>Congratulations on completing The Odyssey!</span>
                  ) : (
                    <span>Stay tuned! More levels will be available soon.</span>
                  )}
                </div>
              )}
              
              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-900/40 rounded-lg">
                  <span className="text-gray-100">Levels completed</span>
                  <span className="text-[#F9DC34] font-bold text-xl">{(userDet?.CL || 1) - 1}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-900/40 rounded-lg">
                  <span className="text-gray-100">Levels available</span>
                  <span className="text-[#F9DC34] font-bold text-xl">{staticData.maxLevel}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-900/40 rounded-lg">
                  <span className="text-gray-100">Score</span>
                  <span className="text-[#F9DC34] font-bold text-xl">{Math.floor(parseFloat(userDet?.S || 0))}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="backdrop-blur-md bg-white/5 rounded-xl p-6 shadow-lg border border-gray-300/20 w-full text-center"
          >
            <div className="inline-block mb-4 w-12 h-12 rounded-full border-4 border-t-[#F9DC34] border-gray-700 animate-spin"></div>
            <p className="text-gray-100 text-lg">Connecting to The Odyssey...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Home;