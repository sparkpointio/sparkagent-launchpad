"use client"

import { ConnectButton } from "thirdweb/react";
import { client } from "./client";
import { arbitrumSepolia } from "thirdweb/chains";
import { AGENTS } from "./utils/agents-sample-data";
import AgentCard from "./components/AgentCard";
import AgentSearchBar from "./components/AgentSearchBar";

export default function Home() {
  const handleSearch = (query: string) => {
    console.log("Search query:", query);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full">

        <AgentSearchBar onSearch={handleSearch} placeholder="Search Agent/Token" />

        {/* Agent Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {AGENTS.map((agent, index) => (
            <AgentCard
              key={index}
              title={agent.title}
              image={agent.image}
              imageAlt={agent.title}
              certificate={agent.certificate}
              description={agent.description}
              createdBy={agent.createdBy}
              marketCap={agent.marketCap}
              datePublished={agent.datePublished}
              sparkingProgress={agent.sparkingProgress}
            />
          ))}
        </div>

        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)] mt-4">
          <li className="mb-2">Test Thirdweb Integration below.</li>
          <li>You will be connected to Arbitrum Sepolia.</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <ConnectButton 
            connectButton={{
              className: "w-full"
            }}
            detailsButton={{
              className: "!w-full justify-center"
            }}
            client={client} 
            chain={arbitrumSepolia} 
          />
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://portal.thirdweb.com/react/v5/getting-started"
            target="_blank"
            rel="noopener noreferrer"
          >
            Thirdweb docs
          </a>
        </div>
      </main>
    </div>
  );
}
