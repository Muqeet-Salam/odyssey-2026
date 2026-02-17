"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { database } from "../../../firebase";
import { ref, onValue, set, off } from "firebase/database";
import {
  convertDotsToUnderscores,
  getIndianEpochTimeFromWorldTimeAPI,
  levelScore,
} from "@/lib/utils";
import { staticData } from "@/lib/staticdata";
import Level1 from "@/components/levels/L1";
import Level2 from "@/components/levels/L2";
import Level3 from "@/components/levels/L3";
import Level4 from "@/components/levels/L4";
import Level5 from "@/components/levels/L5";
import Level6 from "@/components/levels/L6";
import Level7 from "@/components/levels/L7";
import Level8 from "@/components/levels/L8";
import Level9 from "@/components/levels/L9";
import Level10 from "@/components/levels/L10";
import Level11 from "@/components/levels/L11";
import Level12 from "@/components/levels/L12";
import Level13 from "@/components/levels/L13";
import Level14 from "@/components/levels/L14";
import Level15 from "@/components/levels/L15";
import Level16 from "@/components/levels/L16";
import Level17 from "@/components/levels/L17";


const levels = [
  Level1,
  Level2,
  Level3,
  Level4,
  Level5,
  Level6,
  Level7,
  Level8,
  Level9,
  Level10,
  Level11,
  Level12,
  Level13,
  Level14,
  Level15,
  Level16,
  Level17,
];

const Game = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [userDet, setUserDet] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const router = useRouter();

  const getUserId = () => {
    if (!session || !session.user) return null;
    return (
      session.user.id ||
      session.user.uid ||
      session.user.userId ||
      (session.user.email ? convertDotsToUnderscores(session.user.email) : null)
    );
  };

  const handleLevelComplete = async () => {
    setTransitioning(true);
    const userId = getUserId();
    if (userId) {
      await setScore(userId);
      setTimeout(() => {
        setTransitioning(false);
      }, 2000); // Simulate loading time
    }
  };

  const setScore = async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const userRef = ref(database, `/odysseyParticipants/${userId}`);
      const updatedScore = await levelScore(
        userDet?.CL || 0,
        userDet?.CS || 0,
        userDet?.S || 0
      );
      await set(userRef, { CL: (userDet?.CL || 0) + 1, CS: 0, S: updatedScore });
    } catch (error) {
      console.error("Error setting score:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      const userRef = ref(database, `/odysseyParticipants/${userId}`);
      onValue(userRef, (snapshot) => {
        setUserDet(snapshot.val() || { CL: 1, CS: 0, S: 0 });
      });
      return () => off(userRef);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") setLoading(false);
    else if (status !== "loading") router.push("/");
  }, [status]);

  if (loading || !userDet) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  // Allow level selection for testing
  if (selectedLevel === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#111111] p-4">
        <div className="text-center p-8 bg-white/5 backdrop-blur-md rounded-lg shadow-lg border border-gray-700/30 max-w-2xl">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F9DC34] to-[#F5A623] mb-6">Select a Level</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
            {Array.from({ length: staticData.maxLevel }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setSelectedLevel(i + 1)}
                className="p-3 bg-gradient-to-r from-[#F9DC34] to-[#F5A623] text-gray-900 font-bold rounded-lg shadow-lg hover:from-[#FFE55C] hover:to-[#FFBD4A] transform transition-transform hover:scale-110"
              >
                L{i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 font-bold rounded-lg shadow-lg"
          >
            Back Home
          </button>
        </div>
      </div>
    );
  }

  const CurrentLevel = levels[selectedLevel - 1];

  return (
    <div className="w-screen">
      {transitioning ? (
        <div className="h-screen flex items-center justify-center text-2xl font-bold">
          Loading next level...
        </div>
      ) : (
        <>
          <button
            onClick={() => setSelectedLevel(null)}
            className="fixed top-16 left-4 z-50 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold rounded-lg shadow-lg"
          >
            ← Back to Levels
          </button>
          <CurrentLevel onComplete={handleLevelComplete} />
        </>
      )}
    </div>
  );
};

export default Game;
