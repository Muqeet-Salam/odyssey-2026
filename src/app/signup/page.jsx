"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";
import { signIn } from "next-auth/react";
import { auth, database } from "../../../firebase";

const COLLEGE_OPTIONS = ["CBIT", "Other"];

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    college: "",
    otherCollege: "",
    branch: "",
    rollNumber: "",
    year: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isOtherCollege = useMemo(() => form.college === "Other", [form.college]);

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!form.email.trim()) return "Please enter your email.";
    if (!form.branch.trim()) return "Please enter your branch.";
    if (!form.rollNumber.trim()) return "Please enter your roll number.";
    if (!form.year.trim()) return "Please enter your year.";
    if (isOtherCollege && !form.otherCollege.trim()) return "Please enter your college name.";
    if (!form.password) return "Please enter a password.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return "";
  };

  const handleSubmit = async () => {
    setError("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      if (form.name.trim()) {
        await updateProfile(userCredential.user, { displayName: form.name.trim() });
      }

      const profileData = {
        name: form.name.trim(),
        email: form.email.trim(),
        college: isOtherCollege ? form.otherCollege.trim() : form.college,
        branch: form.branch.trim(),
        rollNumber: form.rollNumber.trim(),
        year: form.year.trim(),
        createdAt: new Date().toISOString(),
      };

      const userId = userCredential.user.uid;

      await set(ref(database, `/odysseyUsers/${userId}`), profileData);
      await set(ref(database, `/odysseyParticipants/${userId}`), { CL: 1, CS: 0, S: 0 });

      await signIn("credentials", {
        email: form.email.trim(),
        password: form.password,
        redirect: true,
        callbackUrl: "/",
      });
    } catch (err) {
      console.error("Signup error:", err);
      if (err?.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (err?.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err?.code === "auth/weak-password") {
        setError("Password is too weak. Please use a stronger password.");
      } else {
        setError("Signup failed. Please try again.");
      }
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-4rem)] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl"
      >
        <div className="backdrop-blur-md bg-white/5 rounded-xl p-8 shadow-xl border border-gray-300/20">
          <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#F9DC34] to-[#F5A623]">
            Sign Up
          </h2>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[#F9DC34] text-sm mb-2 font-medium">Name</label>
              <input
                type="text"
                value={form.name}
                className="w-full px-4 py-3 bg-gray-900/30 border border-gray-400/30 focus:border-[#F9DC34]/70 rounded-lg shadow-inner outline-none text-white transition-all duration-200"
                placeholder="Enter your name"
                onChange={handleChange("name")}
              />
            </div>

            <div>
              <label className="block text-[#F9DC34] text-sm mb-2 font-medium">Email ID</label>
              <input
                type="email"
                value={form.email}
                className="w-full px-4 py-3 bg-gray-900/30 border border-gray-400/30 focus:border-[#F9DC34]/70 rounded-lg shadow-inner outline-none text-white transition-all duration-200"
                placeholder="Enter your email"
                onChange={handleChange("email")}
              />
            </div>

            <div>
              <label className="block text-[#F9DC34] text-sm mb-2 font-medium">College</label>
              <select
                value={form.college}
                className="w-full px-4 py-3 bg-gray-900/30 border border-gray-400/30 focus:border-[#F9DC34]/70 rounded-lg shadow-inner outline-none text-white transition-all duration-200"
                onChange={handleChange("college")}
              >
                {COLLEGE_OPTIONS.map((option) => (
                  <option key={option} value={option} className="text-gray-900">
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {isOtherCollege && (
              <div>
                <label className="block text-[#F9DC34] text-sm mb-2 font-medium">College Name</label>
                <input
                  type="text"
                  value={form.otherCollege}
                  className="w-full px-4 py-3 bg-gray-900/30 border border-gray-400/30 focus:border-[#F9DC34]/70 rounded-lg shadow-inner outline-none text-white transition-all duration-200"
                  placeholder="Enter your college name"
                  onChange={handleChange("otherCollege")}
                />
              </div>
            )}

            <div>
              <label className="block text-[#F9DC34] text-sm mb-2 font-medium">Branch</label>
              <input
                type="text"
                value={form.branch}
                className="w-full px-4 py-3 bg-gray-900/30 border border-gray-400/30 focus:border-[#F9DC34]/70 rounded-lg shadow-inner outline-none text-white transition-all duration-200"
                placeholder="Enter your branch"
                onChange={handleChange("branch")}
              />
            </div>

            <div>
              <label className="block text-[#F9DC34] text-sm mb-2 font-medium">Roll Number</label>
              <input
                type="text"
                value={form.rollNumber}
                className="w-full px-4 py-3 bg-gray-900/30 border border-gray-400/30 focus:border-[#F9DC34]/70 rounded-lg shadow-inner outline-none text-white transition-all duration-200"
                placeholder="Enter your roll number"
                onChange={handleChange("rollNumber")}
              />
            </div>

            <div>
              <label className="block text-[#F9DC34] text-sm mb-2 font-medium">Year</label>
              <input
                type="text"
                value={form.year}
                className="w-full px-4 py-3 bg-gray-900/30 border border-gray-400/30 focus:border-[#F9DC34]/70 rounded-lg shadow-inner outline-none text-white transition-all duration-200"
                placeholder="Enter your year"
                onChange={handleChange("year")}
              />
            </div>

            <div>
              <label className="block text-[#F9DC34] text-sm mb-2 font-medium">Password</label>
              <div className="relative">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  value={form.password}
                  className="w-full px-4 py-3 bg-gray-900/30 border border-gray-400/30 focus:border-[#F9DC34]/70 rounded-lg shadow-inner outline-none text-white transition-all duration-200"
                  placeholder="Create a password"
                  onChange={handleChange("password")}
                  onKeyDown={handleKeyPress}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-800/50 transition-colors duration-200"
                  onClick={() => setIsPasswordVisible((prev) => !prev)}
                >
                  {isPasswordVisible ? (
                    <EyeIcon className="w-5 h-5 text-gray-300" />
                  ) : (
                    <EyeSlashIcon className="w-5 h-5 text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[#F9DC34] text-sm mb-2 font-medium">Confirm Password</label>
              <div className="relative">
                <input
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  value={form.confirmPassword}
                  className="w-full px-4 py-3 bg-gray-900/30 border border-gray-400/30 focus:border-[#F9DC34]/70 rounded-lg shadow-inner outline-none text-white transition-all duration-200"
                  placeholder="Confirm your password"
                  onChange={handleChange("confirmPassword")}
                  onKeyDown={handleKeyPress}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-800/50 transition-colors duration-200"
                  onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
                >
                  {isConfirmPasswordVisible ? (
                    <EyeIcon className="w-5 h-5 text-gray-300" />
                  ) : (
                    <EyeSlashIcon className="w-5 h-5 text-gray-300" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoading}
            className="mt-8 w-full py-3 px-4 bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] text-gray-900 font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            onClick={handleSubmit}
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 mr-3 rounded-full border-2 border-t-gray-900 border-gray-900/30 animate-spin"></span>
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-200">Already have an account?</span>{" "}
            <Link
              href="/"
              className="text-[#F9DC34] text-sm font-semibold hover:text-[#FFE55C] transition-colors duration-200"
            >
              Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
