import React, { useState } from 'react';
import Navbar from "../components/Navbar";
import Features from "../components/Features";

export default function Landing() {
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">

      {/* --- NAVBAR --- */}
      <Navbar />

      {/* --- HERO SECTION --- */}
      <main className="max-w-4xl mx-auto mt-20 px-6 text-center">
        <h1 className="text-5xl font-extrabold mb-6">
          Build things faster with MySaaS
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          The easiest way to manage your tasks, team, and time. No coding required.
        </p>

        <button
          onClick={() => setJoinedWaitlist(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors"
        >
          {joinedWaitlist ? "You're on the list! 🎉" : "Join the Waitlist"}
        </button>
      </main>

      {/* --- FEATURES SECTION --- */}
      <Features />

      {/* --- PRICING SECTION --- */}
      <section className="max-w-5xl mx-auto mt-32 px-6 text-center">
        <h2 className="text-4xl font-extrabold mb-4">Simple, transparent pricing</h2>
        <p className="text-lg text-gray-600 mb-12">Choose the plan that works best for you.</p>

        {/* Grid container for the 3 cards */}
        <div className="grid md:grid-cols-3 gap-8 text-left">
          
          {/* 1. FREE TIER CARD */}
          {/* Notice the 'group' class here. It lets us trigger changes inside when hovered! */}
          <div className="group bg-white p-8 rounded-2xl shadow-md border border-gray-200 flex flex-col transition-all duration-300 hover:-translate-y-4 hover:shadow-2xl hover:bg-blue-600 hover:border-blue-600 cursor-pointer">
            <h3 className="text-xl font-bold text-gray-900 mb-4 transition-colors group-hover:text-white">Free Plan</h3>
            <p className="text-4xl font-extrabold text-gray-900 mb-6 transition-colors group-hover:text-white">
              0 <span className="text-lg text-gray-500 font-medium transition-colors group-hover:text-blue-200">/mo</span>
            </p>
            
            <ul className="space-y-3 mb-8 text-gray-600 flex-grow transition-colors group-hover:text-blue-100">
              <li>✔️ Use it for free</li>
              <li>✔️ Up to 2 accounts</li>
              <li>✔️ Up to 50 leads</li>
            </ul>
            
            <button className="w-full bg-gray-100 text-gray-900 font-bold py-3 rounded-lg transition-all group-hover:bg-white group-hover:text-blue-600">
              Start for Free
            </button>
          </div>

          {/* 2. MONTHLY TIER CARD */}
          <div className="group relative bg-white p-8 rounded-2xl shadow-md border border-gray-200 flex flex-col transition-all duration-300 hover:-translate-y-4 hover:shadow-2xl hover:bg-blue-600 hover:border-blue-600 cursor-pointer">
            {/* Optional "Most Popular" badge */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Most Popular
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-4 transition-colors group-hover:text-white">Pro Monthly</h3>
            <p className="text-4xl font-extrabold text-gray-900 mb-6 transition-colors group-hover:text-white">
              639 <span className="text-lg text-gray-500 font-medium transition-colors group-hover:text-blue-200">/mo</span>
            </p>
            
            <ul className="space-y-3 mb-8 text-gray-600 flex-grow transition-colors group-hover:text-blue-100">
              <li>✔️ Unlimited accounts</li>
              <li>✔️ Unlimited leads</li>
              <li>✔️ Use as much as you want</li>
            </ul>
            
            <button className="w-full bg-gray-100 text-gray-900 font-bold py-3 rounded-lg transition-all group-hover:bg-white group-hover:text-blue-600">
              Subscribe Now
            </button>
          </div>

          {/* 3. LIFETIME TIER CARD */}
          <div className="group bg-white p-8 rounded-2xl shadow-md border border-gray-200 flex flex-col transition-all duration-300 hover:-translate-y-4 hover:shadow-2xl hover:bg-blue-600 hover:border-blue-600 cursor-pointer">
            <h3 className="text-xl font-bold text-gray-900 mb-4 transition-colors group-hover:text-white">Lifetime Deal</h3>
            <p className="text-4xl font-extrabold text-gray-900 mb-6 transition-colors group-hover:text-white">
              9,999 <span className="text-lg text-gray-500 font-medium transition-colors group-hover:text-blue-200">/once</span>
            </p>
            
            <ul className="space-y-3 mb-8 text-gray-600 flex-grow transition-colors group-hover:text-blue-100">
              <li>✔️ Pay once, use forever</li>
              <li>✔️ All Pro features included</li>
              <li>✔️ Lifetime updates & support</li>
            </ul>
            
            <button className="w-full bg-gray-100 text-gray-900 font-bold py-3 rounded-lg transition-all group-hover:bg-white group-hover:text-blue-600">
              Get Lifetime Access
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}