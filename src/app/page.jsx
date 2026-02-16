"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

const LoadingScreen = () => (
  <div className="flex items-center justify-center w-full h-screen bg-gradient-to-b from-[#1A1A1A] to-[#111111]">
    <div className="backdrop-blur-md bg-white/5 rounded-xl p-8 shadow-lg border border-gray-300/20 flex flex-col items-center">
      <div className="w-16 h-16 rounded-full border-4 border-t-[#F9DC34] border-gray-700 animate-spin mb-6"></div>
      <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#F9DC34] to-[#F5A623] animate-pulse">
        Loading...
      </h2>
    </div>
  </div>
);

const DynamicHome = dynamic(() => import("@/components/Home"), {
  loading: () => <LoadingScreen />
});

const DynamicLogin = dynamic(() => import("@/components/Login"), {
  loading: () => <LoadingScreen />
});

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#1A1A1A] to-[#111111] overflow-hidden relative">
      {/* Subtle grid + glow inherited from Home/Login backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="bgGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F9DC34" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bgGrid)" />
        </svg>
      </div>
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(249,220,52,0.06) 0%, rgba(245,166,35,0.03) 30%, transparent 70%)" }}
      />

      {status === "loading" ? (
        <LoadingScreen />
      ) : session ? (
        <Suspense fallback={<LoadingScreen />}>
          <DynamicHome />
        </Suspense>
      ) : (
        <Suspense fallback={<LoadingScreen />}>
          <DynamicLogin />
        </Suspense>
      )}
    </main>
  );
}