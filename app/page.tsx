"use client"
import Hero from "./components/Hero";
import Agents from "./components/Agents";

export default function Home() {


  return (
    <div className="min-h-screen bg-1 overflow-hidden dark:bg-[#1a1d21]">
      <Hero />
      <Agents />
    </div>
  );
}
