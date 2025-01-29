"use client";
import React, { useCallback, useEffect, useState } from "react";
import AgentSearchBar from "./AgentSearchBar";
import { AGENTS } from "../lib/utils/agents-sample-data";
import AgentCard from "./AgentCard";
import AgentFilter from "./AgentFilter";
import { new_sparkpoint_logo_full_dark, new_sparkpoint_logo_full_light } from "../lib/assets";
import Image from "next/image";

const Agents = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredAgents, setFilteredAgents] = useState(AGENTS);

    const handleFilterChange = useCallback((filterType: string, value: string | boolean | null) => {
        let filtered = [...AGENTS];

        // Apply search filter first
        if (searchQuery.trim()) {
            const searchTerm = searchQuery.toLowerCase();
            filtered = filtered.filter(agent =>
                agent.title.toLowerCase().includes(searchTerm) ||
                agent.description.toLowerCase().includes(searchTerm) ||
                agent.certificate.toLowerCase().includes(searchTerm) ||
                agent.createdBy.toLowerCase().includes(searchTerm)
            );
        }

        // Apply market cap filter
        if (value === "high") {
            filtered.sort((a, b) => b.marketCap - a.marketCap);
        } else if (value === "low") {
            filtered.sort((a, b) => a.marketCap - b.marketCap);
        }

        // Apply new pairs filter (last 7 days)
        if (filterType === 'newPairs' && value === true) {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            filtered = filtered.filter(agent => agent.datePublished >= sevenDaysAgo);
        }

        // Apply graduated filter
        if (filterType === 'graduated' && value === true) {
            filtered = filtered.filter(agent => agent.sparkingProgress === 100);
        }

        setFilteredAgents(filtered);
    }, [searchQuery]);

    useEffect(() => {
        handleFilterChange('search', searchQuery);
    }, [searchQuery, handleFilterChange]);

    return (
        <section className="items-center justify-center min-h-screen m-6 lg:mx-2 xl:mx-10 2xl:mx-24">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-10 2xl:gap-24 w-full">
                {/* First Column */}
                <div className="flex flex-col">
                    <div className="flex items-center h-14 mb-8 select-none">
                        <Image
                            src={new_sparkpoint_logo_full_dark}
                            alt="SparkPoint Logo"
                            className="h-12 w-fit dark:hidden block"
                            unselectable="on"
                        />
                        <Image
                            src={new_sparkpoint_logo_full_light}
                            alt="SparkPoint Logo"
                            className="h-12 w-fit dark:block hidden"
                            unselectable="on"
                        />
                    </div>
                    <AgentFilter onFilterChange={handleFilterChange} />
                </div>

                {/* Second Column */}
                <div className="lg:col-span-2 w-full">
                    <div className="flex items-center justify-center h-16 mb-6">
                        <AgentSearchBar onSearch={(query: string) => {
                            setSearchQuery(query);
                        }} onClear={() => {
                            setSearchQuery("");
                            setFilteredAgents(AGENTS); // Reset to original agents list
                        }} placeholder="Search Agent/Token" />
                    </div>

                    {/* Agent Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6 w-full">
                        {filteredAgents.length > 0 ? (
                            filteredAgents.map((agent, index) => (
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
                            ))
                        ) : (
                            <div className="col-span-full text-xl text-center py-8 text-gray-500">
                                No agents found
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Agents;