"use client";
import React, { useCallback, useEffect, useState } from "react";
import AgentSearchBar from "./AgentSearchBar";
import AgentCard from "./AgentCard";
import AgentFilter from "./AgentFilter";
import { client } from "../client";
import { IconLoader3 } from "@tabler/icons-react";

const unsparkingAIContract = getContract({
    client,
    chain: arbitrumSepolia,
    address: process.env.NEXT_PUBLIC_UNSPARKINGAI_PROXY as string,
});

import { getContract, readContract, toEther } from "thirdweb";
import { arbitrumSepolia } from "thirdweb/chains";
import SparkAgentLogo from "./SparkAgentLogo";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

const Agents = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const agentsPerPage = 6;

    interface AgentData {
        creator: string;
        certificate: string;
        pair: string;
        agentToken: string;
        token: string;
        tokenName: string;
        _tokenName: string;
        tokenTicker: string;
        supply: number;
        price: number;
        marketCap: number;
        liquidity: number;
        volume: number;
        volume24H: number;
        prevPrice: number;
        lastUpdated: Date;
        description: string;
        image: string;
        twitter: string;
        telegram: string;
        youtube: string;
        website: string;
        trading: boolean;
        tradingOnUniSwap: boolean;
        gradThreshold: bigint;
        reserveB: bigint;
    }

    interface RawAgentData {
        address: string;
        data: [
            string, // creator
            string, // certificate
            string, // pair
            string, // agentToken
            [
                string, // token
                string, // tokenName
                string, // _tokenName
                string, // tokenTicker
                string, // supply
                string, // price
                string, // marketCap
                string, // liquidity
                string, // volume
                string, // volume24H
                string, // prevPrice
                string  // lastUpdated (Unix timestamp)
            ],
            string, // description
            string, // image
            string, // twitter
            string, // telegram
            string, // youtube
            string, // website
            boolean, // trading
            boolean // tradingOnUniSwap
        ];
        reserves: [
            string, // Reserve A
            string, // Reserve B
        ]
    }

    const [agentsData, setAgentsData] = useState<AgentData[]>([]);
    const [filteredAgents, setFilteredAgents] = useState<AgentData[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const parseAgentData = useCallback((agent: RawAgentData, gradThreshold?: bigint): AgentData => {
        const data = agent.data; // Extract `data` array
        const tokenData = data[4]; // Extract the nested token data

        return {
            creator: data[0],
            certificate: data[1],
            pair: data[2],
            agentToken: data[3],
            token: tokenData[0],
            tokenName: tokenData[1],
            _tokenName: tokenData[2],
            tokenTicker: tokenData[3],
            supply: Number(tokenData[4]),
            price: Number(tokenData[5]),
            marketCap: parseInt(toEther(BigInt(tokenData[6]))), // TODO: Convert to USD
            liquidity: Number(tokenData[7]),
            volume: Number(tokenData[8]),
            volume24H: Number(tokenData[9]),
            prevPrice: Number(tokenData[10]),
            lastUpdated: new Date(Number(tokenData[11]) * 1000), // Convert Unix timestamp to Date
            description: data[5],
            image: data[6],
            twitter: data[7],
            telegram: data[8],
            youtube: data[9],
            website: data[10],
            trading: data[11],
            tradingOnUniSwap: data[12],
            gradThreshold: gradThreshold ?? BigInt(0),
            reserveB: BigInt(agent.reserves[1]),
        };
    }, []);

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const [response, gradThresholdValue] = await Promise.all([
                    fetch(`api/tokens`),
                    readContract({
                        contract: unsparkingAIContract,
                        method: "function gradThreshold() returns (uint256)",
                        params: [],
                    }),
                ]);

                if (!response.ok) throw new Error("Failed to fetch data");

                const jsonResponse = await response.json();

                if (!jsonResponse.tokens || !Array.isArray(jsonResponse.tokens)) {
                    throw new Error("API response does not contain 'tokens' array.");
                }

                const rawAgents: RawAgentData[] = jsonResponse.tokens;

                // Convert raw data to `AgentData` type
                const parsedAgents: AgentData[] = rawAgents.map((agent) =>
                    parseAgentData(agent, gradThresholdValue ?? BigInt(0))
                );

                setAgentsData(parsedAgents);
                setFilteredAgents(parsedAgents);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching agents:", error);
            }
        };

        fetchAgents();
    }, [parseAgentData]);

    const handleFilterChange = useCallback((filterType: string, value: string | boolean | null) => {
        let filtered = [...agentsData];

        // Apply search filter first
        if (searchQuery.trim()) {
            const searchTerm = searchQuery.toLowerCase();
            filtered = filtered.filter(agent =>
                agent._tokenName.toLowerCase().includes(searchTerm) ||
                agent.description.toLowerCase().includes(searchTerm) ||
                agent.certificate.toLowerCase().includes(searchTerm) ||
                agent.creator.toLowerCase().includes(searchTerm)
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
                filtered.sort((a, b) => b.price - a.price);
            } else if (value === "low") {
                filtered.sort((a, b) => a.price - b.price);
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
        
            filtered = filtered
                .filter(agent => agent.lastUpdated >= sevenDaysAgo)
                .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()); // Sort by most recent
        }

        // Apply sparked filter
        if (filterType === 'sparked' && value === true) {
            filtered = filtered.filter(agent => !agent.trading);
        }

        setFilteredAgents(filtered);
    }, [searchQuery, agentsData]);

    useEffect(() => {
        handleFilterChange('search', searchQuery);
    }, [searchQuery, handleFilterChange, agentsData]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const indexOfLastAgent = currentPage * agentsPerPage;
    const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
    const currentAgents = filteredAgents.slice(indexOfFirstAgent, indexOfLastAgent);
    const totalPages = Math.ceil(filteredAgents.length / agentsPerPage);

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 3;
        const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers;
    };

    return (
        <section className="items-center justify-center min-h-screen m-6 lg:mx-2 xl:mx-10 2xl:mx-24">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 xl:gap-10 2xl:gap-24 w-full">
                {/* First Column */}
                <div className="flex flex-col">
                    <div className="flex items-center h-14 mb-8 select-none">
                        <SparkAgentLogo />
                    </div>
                    <AgentFilter onFilterChange={handleFilterChange} />
                </div>

                {/* Second Column */}
                <div className="lg:col-span-3 w-full">
                    <div className="flex items-center justify-center h-16 mb-6">
                        <AgentSearchBar
                            onSearch={(query: string) => {
                                setSearchQuery(query);
                            }}
                            onClear={() => {
                                setSearchQuery("");
                                setFilteredAgents(agentsData); // Reset to original agents list
                            }}
                            onSearchButtonClick={() => {
                                setCurrentPage(1);
                            }}
                            placeholder="Search Agent/Token"
                        />
                    </div>

                    {isLoading && (
                        <div className="py-[100px]">
                            <div className="flex items-center justify-center inset-0 mb-2">
                                <IconLoader3 size={64} className="animate-spin text-gray-600 dark:text-[#ffffff]" />
                            </div>
                            <p className="text-center dark:text-[#ffffff]">Loading Agent Tokens</p>
                        </div>
                    )}

                    {/* Agent Cards */}
                    {!isLoading && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-3 gap-6 w-full">
                                {currentAgents.length > 0 ? (
                                    currentAgents
                                        .map((agent, index) => (
                                            <AgentCard
                                                key={`${currentPage}-${index}`}
                                                title={agent._tokenName}
                                                image={agent.image}
                                                imageAlt={agent._tokenName}
                                                certificate={agent.certificate}
                                                description={agent.description}
                                                createdBy={agent.creator}
                                                marketCap={agent.marketCap}
                                                datePublished={agent.lastUpdated}
                                                website={agent.website}
                                                twitter={agent.twitter}
                                                telegram={agent.telegram}
                                                youtube={agent.youtube}
                                                trading={agent.trading}
                                                gradThreshold={agent.gradThreshold}
                                                reserveB={agent.reserveB}
                                            />
                                        ))
                                ) : (
                                    <div className="col-span-full text-xl text-center py-8 text-gray-500">
                                        No agents found
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    className={`px-4 py-2 mx-1 rounded-lg transition-all ${currentPage === 1 ? "bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-600" : "bg-gray-200 text-gray-700 hover:bg-sparkyOrange-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-sparkyOrange-700"} `}
                                    disabled={currentPage === 1}
                                >
                                    {<IconArrowLeft />}
                                </button>
                                {getPageNumbers().map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`px-4 py-2 mx-1 rounded-lg transition-all ${currentPage === pageNumber ? 'bg-sparkyOrange-500 text-white dark:bg-sparkyOrange-700' : 'hover:bg-sparkyOrange-200 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-sparkyOrange-700'}`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    className="px-4 py-2 mx-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-sparkyOrange-200 transition-all dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-sparkyOrange-700"
                                    disabled={currentPage === totalPages}
                                >
                                    {<IconArrowRight />}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Agents;