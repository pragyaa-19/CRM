import React, { useState } from 'react';
import Navbar from "../components/Navbar";
import Features from "../components/Features";

// ---------------------------------------------------------
// 1. A COMPONENT: This is a reusable "Lego block". 
// Instead of writing the feature box 3 times, we write it once.
// ---------------------------------------------------------


// ---------------------------------------------------------
// 2. THE MAIN PAGE: This is where we put the blocks together.
// ---------------------------------------------------------
export default function Landing() {

  // STATE: This is React's "memory". 
  // It remembers if the user has clicked the button (true or false).
  // We start it as 'false' (they haven't joined yet).
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);

  return (
    // min-h-screen makes the background cover the whole height of your screen
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

      {/* --- NAVBAR --- */}
      <Navbar />

      {/* --- HERO SECTION (The big text at the top) --- */}
      <main className="max-w-4xl mx-auto mt-20 px-6 text-center">
        <h1 className="text-5xl font-extrabold mb-6">
          Build things faster with MySaaS
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          The easiest way to manage your tasks, team, and time. No coding required.
        </p>

        {/* --- INTERACTIVE BUTTON --- */}
        {/* When clicked, we change our "memory" to true */}
        <button
          onClick={() => setJoinedWaitlist(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors"
        >
          {/* If joinedWaitlist is true, show the first text. If false, show the second. */}
          {joinedWaitlist ? "You're on the list! 🎉" : "Join the Waitlist"}
        </button>
      </main>

      {/* --- FEATURES SECTION --- */}
    <Features />
    </div >
  );
}