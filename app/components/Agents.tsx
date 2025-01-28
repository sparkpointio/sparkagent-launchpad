"use client";
import React, { useState } from "react";
import AgentSearchBar from "./AgentSearchBar";
import { AGENTS } from "../lib/utils/agents-sample-data";
import AgentCard from "./AgentCard";
import AgentFilter from "./AgentFilter";
import { new_sparkpoint_logo_full_dark } from "../lib/assets";
import Image from "next/image";

const Agents = () => {
    const [sortedAgents, setSortedAgents] = useState(AGENTS);
    const [sortConfig, setSortConfig] = useState<{ criterion: string, ascending: boolean }>({ criterion: "", ascending: true });

    const handleSearch = (query: string) => {
        console.log("Search query:", query);
    };

    const handleSort = (criterion: string) => {
        let ascending = sortConfig.ascending;
        if (sortConfig.criterion === criterion) {
            ascending = !ascending;
        } else {
            ascending = true;
        }

        const sorted = [...sortedAgents].sort((a, b) => {
            if (criterion === "sparkingProgress") {
                return ascending ? a.sparkingProgress - b.sparkingProgress : b.sparkingProgress - a.sparkingProgress;
            } else if (criterion === "marketCap") {
                return ascending ? a.marketCap - b.marketCap : b.marketCap - a.marketCap;
            } else if (criterion === "datePublished") {
                return ascending ? new Date(a.datePublished).getTime() - new Date(b.datePublished).getTime() : new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime();
            } else if (criterion === "volume") {
                return ascending ? a.volume - b.volume : b.volume - a.volume;
            } else if (criterion === "tokenPrice") {
                return ascending ? a.tokenPrice - b.tokenPrice : b.tokenPrice - a.tokenPrice;
            }
            return 0;
        });

        setSortedAgents(sorted);
        setSortConfig({ criterion, ascending });
    };

    return (
        <section className="items-center justify-center min-h-screen m-6 lg:mx-2 xl:mx-10 2xl:mx-24">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-10 2xl:gap-24 w-full">

                {/* First Column */}
                <div className="flex flex-col">
                    <div className="flex items-center h-14 mb-8 select-none">
                        <Image
                            src={new_sparkpoint_logo_full_dark}
                            alt="SparkPoint Logo"
                            className="h-12 w-fit"
                            unselectable="on"
                        />
                    </div>
                    <AgentFilter 
                        onSort={(criterion) => handleSort(criterion)} 
                        sortConfig={sortConfig}
                    />
                </div>

                {/* Second Column */}
                <div className="lg:col-span-2 w-full">
                    <div className="flex items-center justify-center h-16 mb-6">
                        <AgentSearchBar onSearch={handleSearch} placeholder="Search Agent/Token" />
                    </div>

                    {/* Agent Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6 w-full">
                        {sortedAgents.map((agent, index) => (
                            <AgentCard
                                key={`${sortConfig.criterion}-${sortConfig.ascending}-${index}`}
                                title={agent.title}
                                image={agent.image}
                                imageAlt={agent.title}
                                certificate={agent.certificate}
                                description={agent.description}
                                createdBy={agent.createdBy}
                                marketCap={agent.marketCap}
                                datePublished={agent.datePublished}
                                sparkingProgress={agent.sparkingProgress}
                                //volume={agent.volume}
                                //tokenPrice={agent.tokenPrice}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Agents;