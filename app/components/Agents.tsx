"use client";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import AgentSearchBar from "./AgentSearchBar";
import AgentCard from "./AgentCard";
import AgentFilter from "./AgentFilter";
import AgentSort from "./AgentSort";
import { client } from "../client";
import { IconLoader2 } from "@tabler/icons-react";
import { getContract, readContract, toEther } from "thirdweb";
import { selectedChain } from "../lib/chain-thirdweb";
import SparkAgentLogo from "./SparkAgentLogo";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

const unsparkingAIContract = getContract({
    client,
    chain: selectedChain,
    address: process.env.NEXT_PUBLIC_UNSPARKINGAI_PROXY as string,
});

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
        initialLiquidity: bigint;
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
    const [activeSorting, setActiveSorting] = useState({
        volume: null as "high" | "low" | null,
        marketCap: null as "high" | "low" | null,
        price: null as "high" | "low" | null
    });
    const [activeFilters, setActiveFilters] = useState({
        newPairs: false,
        sparked: false,
    });

    const parseAgentData = useCallback((agent: RawAgentData, gradThreshold?: bigint, initialLiquidity?: bigint): AgentData => {
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
            website: data[7],
            twitter: data[8],
            telegram: data[9],
            youtube: data[10],
            trading: data[11],
            tradingOnUniSwap: data[12],
            gradThreshold: gradThreshold ?? BigInt(0),
            initialLiquidity: initialLiquidity ?? BigInt(0),
            reserveB: BigInt(agent.reserves[1]),
        };
    }, []);

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const [response, gradThresholdValue, initialLiquidity] = await Promise.all([
                    fetch(`api/tokens`),
                    readContract({
                        contract: unsparkingAIContract,
                        method: "function gradThreshold() returns (uint256)",
                        params: [],
                    }),
                    readContract({
                        contract: unsparkingAIContract,
                        method: "function L() returns (uint256)",
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
                    parseAgentData(agent, gradThresholdValue ?? BigInt(0), initialLiquidity ?? BigInt(0))
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
    
    const applyFiltersAndSorting = useCallback(() => {
        let filtered = [...agentsData];
    
        // console.log("Initial agents data:", agentsData);
    
        // Apply search filter first
        if (searchQuery.trim()) {
            const searchTerm = searchQuery.toLowerCase();
            filtered = filtered.filter(agent =>
                agent._tokenName.toLowerCase().includes(searchTerm) ||
                agent.description.toLowerCase().includes(searchTerm) ||
                agent.certificate.toLowerCase().includes(searchTerm) ||
                agent.creator.toLowerCase().includes(searchTerm) ||
                agent.tokenTicker.toLowerCase().includes(searchTerm)
            );
            // console.log("After search filter:", filtered.map(agent => ({
            //     _tokenName: agent._tokenName,
            //     description: agent.description,
            //     certificate: agent.certificate,
            //     creator: agent.creator
            // })));
        }
    
        // Apply new pairs filter (last 7 days)
        if (activeFilters.newPairs) {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
            filtered = filtered
                .filter(agent => agent.lastUpdated >= sevenDaysAgo)
                .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()); // Sort by most recent
            // console.log("After new pairs filter:", filtered.map(agent => ({
            //     _tokenName: agent._tokenName,
            //     lastUpdated: agent.lastUpdated
            // })));
        }
    
        // Apply sparked filter
        if (activeFilters.sparked) {
            filtered = filtered.filter(agent => !agent.trading);
            // console.log("After sparked filter:", filtered.map(agent => ({
            //     _tokenName: agent._tokenName,
            //     trading: agent.trading
            // })));
        }
    
        // Apply sorting
        if (activeSorting.volume) {
            filtered.sort((a, b) => activeSorting.volume === "high" ? b.volume - a.volume : a.volume - b.volume);
            // console.log("After volume sorting:", filtered.map(agent => ({
            //     _tokenName: agent._tokenName,
            //     volume: agent.volume
            // })));
        } else if (activeSorting.marketCap) {
            filtered.sort((a, b) => activeSorting.marketCap === "high" ? b.marketCap - a.marketCap : a.marketCap - b.marketCap);
            // console.log("After market cap sorting:", filtered.map(agent => ({
            //     _tokenName: agent._tokenName,
            //     marketCap: agent.marketCap
            // })));
        } else if (activeSorting.price) {
            filtered.sort((a, b) => activeSorting.price === "high" ? b.price - a.price : a.price - b.price);
            // console.log("After price sorting:", filtered.map(agent => ({
            //     _tokenName: agent._tokenName,
            //     price: agent.price
            // })));
        }
    
        setFilteredAgents(filtered);
    }, [searchQuery, agentsData, activeFilters, activeSorting]);

    const handleFilterChange = useCallback((filterType: string, value: string | boolean | null) => {
        setActiveFilters(prevFilters => ({
            ...prevFilters,
            [filterType]: value
        }));
    }, []);

    const handleSortingChange = useCallback((sortType: string, value: string | boolean | null) => {
        const newSorting = {
            volume: null as "high" | "low" | null,
            marketCap: null as "high" | "low" | null,
            price: null as "high" | "low" | null
        };

        newSorting[sortType as keyof typeof newSorting] = value as "high" | "low" | null;
        setActiveSorting(newSorting);
    }, []);

    useEffect(() => {
        applyFiltersAndSorting();
        setCurrentPage(1);
    }, [searchQuery, activeFilters, activeSorting, applyFiltersAndSorting]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const indexOfLastAgent = currentPage * agentsPerPage;
    const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
    const currentAgents = filteredAgents.slice(indexOfFirstAgent, indexOfLastAgent);
    const totalPages = useMemo(() => Math.ceil(filteredAgents.length / agentsPerPage), [filteredAgents.length, agentsPerPage]);

    const getPageNumbers = useCallback((maxPagesToShow: number) => {
        const pageNumbers = [];
        const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers;
    }, [currentPage, totalPages]);

    return (
        <section className="items-center justify-center min-h-screen m-6 lg:mx-2 xl:mx-10 2xl:mx-24">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 xl:gap-10 2xl:gap-24 w-full">
                {/* First Column */}
                <div className="flex flex-col mb-2">
                    <div className="flex items-center h-14 mb-8 select-none">
                        <SparkAgentLogo />
                    </div>
                    <div className="flex flex-col gap-6">
                        <AgentFilter onFilterChange={handleFilterChange} />
                        <AgentSort onSortingChange={handleSortingChange} />
                    </div>
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
                            placeholder="Search Agent/Token"
                        />
                    </div>

                    {isLoading && (
                        <div className="py-[100px]">
                            <div className="flex items-center justify-center inset-0 mb-2">
                                <IconLoader2 size={64} className="animate-spin text-gray-600 dark:text-[#ffffff]" />
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
                                                key={`${currentPage}-${index}-${agent.certificate}`}
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
                                                initialLiquidity={agent.initialLiquidity}
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
                                    type="button"
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    className={`px-4 py-2 mx-1 rounded-lg transition-all ${currentPage === 1 ? "bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-600" : "bg-gray-200 text-gray-700 hover:bg-sparkyOrange-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-sparkyOrange-700"} `}
                                    disabled={currentPage === 1}
                                    aria-label="Previous page"
                                >
                                    {<IconArrowLeft />}
                                </button>
                                <section className="hidden md:block">
                                    {getPageNumbers(5).map((pageNumber) => (
                                        <button
                                            type="button"
                                            key={pageNumber}
                                            onClick={() => handlePageChange(pageNumber)}
                                            aria-label={`Page ${pageNumber}`}
                                            className={`px-4 py-2 mx-1 rounded-lg transition-all ${currentPage === pageNumber ? 'bg-sparkyOrange-500 text-white dark:bg-sparkyOrange-700' : 'hover:bg-sparkyOrange-200 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-sparkyOrange-700'}`}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}
                                </section>
                                <section className="block md:hidden">
                                    {getPageNumbers(3).map((pageNumber) => (
                                        <button
                                            key={pageNumber}
                                            onClick={() => handlePageChange(pageNumber)}
                                            className={`px-4 py-2 mx-1 rounded-lg transition-all ${currentPage === pageNumber ? 'bg-sparkyOrange-500 text-white dark:bg-sparkyOrange-700' : 'hover:bg-sparkyOrange-200 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-sparkyOrange-700'}`}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}
                                </section>
                                <button
                                    type="button"
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    className="px-4 py-2 mx-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-sparkyOrange-200 transition-all dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-sparkyOrange-700"
                                    disabled={currentPage === totalPages}
                                    aria-label="Next page"
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