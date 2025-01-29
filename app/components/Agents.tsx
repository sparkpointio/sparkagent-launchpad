"use client";
import React, { useCallback, useEffect, useState } from "react";
import AgentSearchBar from "./AgentSearchBar";
import { AGENTS } from "../lib/utils/agents-sample-data";
import AgentCard from "./AgentCard";
import AgentFilter from "./AgentFilter";
import { new_sparkpoint_logo_full_dark, new_sparkpoint_logo_full_light } from "../lib/assets";
import Image from "next/image";
import { client } from "../client";

const unsparkingAIContract = getContract({
    client,
    chain: arbitrumSepolia,
    address: process.env.NEXT_PUBLIC_UNSPARKINGAI_PROXY as string,
});

import {
  useReadContract,
} from "thirdweb/react";
import { getContract } from "thirdweb";
import { arbitrumSepolia } from "thirdweb/chains";

const Agents = () => {
    const [agents, setAgents] = useState<string[]>([]);
    const [index, setIndex] = useState(0);
    const [address, setAddress] = useState<string>("");
    interface AgentData {
        creator: string,
        certificate: string,
        pair: string,
        agentToken: string,
        title: string,
        tokenName: string,
        tokenSymbol: string,
        tokenNumberOne: number,
        tokenNumberTwo: number,
        tokenNumberThree: number,
        tokenNumberFour: number,
        tokenNumberFive: number,
        tokenNumberSix: number,
        tokenNumberSeven: number,
        tokenNumberEight: number,
        description: string,
        image: string,
        twitter: string,
        telegram: string,
        youtube: string,
        website: string,
        trading: boolean,
        tradingOnUniSwap: boolean,
    }
    
    const [agentsData, setAgentsData] = useState<AgentData[]>([]);

    const { data } = useReadContract({
        contract: unsparkingAIContract,
        method: "function tokenInfos(uint256) returns (address)",
        params: [BigInt(index)],
    });

    const { data: agentData } = useReadContract({
        contract: unsparkingAIContract,
        method: "function tokenInfo(address) returns (address, address, address, address, (address, string, string, string, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256), string, string, string, string, string, string, bool, bool)",
        params: [address],
    });

    useEffect(() => {
        if (data) {
            setAgents((prevAgents) => [...prevAgents, data.toString()]);
            setIndex((prevIndex) => prevIndex + 1);
            setAddress(data.toString());
        }
    }, [data]);

    useEffect(() => {
        if (agentData) {
            console.log("Agent data:", agentData);
            const parsedData = {
                creator: agentData[0].toString(),
                certificate: agentData[1].toString(),
                pair: agentData[2].toString(),
                agentToken: agentData[3].toString(),
                tokenAddress: agentData[4][0].toString(),
                title: agentData[4][1].toString(),
                tokenName: agentData[4][2].toString(),
                tokenSymbol: agentData[4][3].toString(),
                tokenNumberOne: parseInt(agentData[4][4].toString()),
                tokenNumberTwo: parseInt(agentData[4][5].toString()),
                tokenNumberThree: parseInt(agentData[4][6].toString()),
                tokenNumberFour: parseInt(agentData[4][7].toString()),
                tokenNumberFive: parseInt(agentData[4][8].toString()),
                tokenNumberSix: parseInt(agentData[4][9].toString()),
                tokenNumberSeven: parseInt(agentData[4][10].toString()),
                tokenNumberEight: parseInt(agentData[4][11].toString()),
                description: agentData[5].toString(),
                image: agentData[6].toString(),
                twitter: agentData[7].toString(),
                telegram: agentData[8].toString(),
                youtube: agentData[9].toString(),
                website: agentData[10].toString(),
                trading: agentData[11].valueOf(),
                tradingOnUniSwap: agentData[12]?.valueOf(),
            };
            setAgentsData((prevAgentsData) => [...prevAgentsData, parsedData]);
        }
    }, [agentData]);

    useEffect(() => {
        if (index > 0 && !data) {
            console.log("No more addresses found");
        }
    }, [index, data]);

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
        if (filterType === "marketCap") {
            if (value === "high") {
                filtered.sort((a, b) => b.marketCap - a.marketCap);
            } else if (value === "low") {
                filtered.sort((a, b) => a.marketCap - b.marketCap);
            }
        }

        // Apply token price filter
        if (filterType === "price") {
            if (value === "high") {
                filtered.sort((a, b) => b.tokenPrice - a.tokenPrice);
            } else if (value === "low") {
                filtered.sort((a, b) => a.tokenPrice - b.tokenPrice);
            }
        }

        // Apply volume filter
        if (filterType === "volume") {
            if (value === "high") {
                filtered.sort((a, b) => b.volume - a.volume);
            } else if (value === "low") {
                filtered.sort((a, b) => a.volume - b.volume);
            }
        }

        // Apply new pairs filter (last 7 days)
        if (filterType === 'newPairs' && value === true) {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            filtered = filtered.filter(agent => agent.datePublished >= sevenDaysAgo);
        }

        // Apply sparked filter
        if (filterType === 'sparked' && value === true) {
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
                        {agentsData.length > 0 ? (
                            agentsData
                                .filter(agent => agent.certificate !== "0x0000000000000000000000000000000000000000")
                                .map((agent, index) => (
                                    <AgentCard
                                        key={index}
                                        title={agent.tokenName}
                                        image={AGENTS[1].image}
                                        imageAlt={agent.tokenName}
                                        certificate={agent.certificate}
                                        description={agent.description}
                                        createdBy={agent.creator}
                                        marketCap={AGENTS[1].marketCap}
                                        datePublished={AGENTS[1].datePublished}
                                        sparkingProgress={AGENTS[1].sparkingProgress}
                                        //tokenPrice={agent.tokenPrice}
                                        //volume={agent.volume}
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