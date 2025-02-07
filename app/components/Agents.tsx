"use client";
import React, { useCallback, useEffect, useState } from "react";
import AgentSearchBar from "./AgentSearchBar";
import AgentCard from "./AgentCard";
import AgentFilter from "./AgentFilter";
import { client } from "../client";

const unsparkingAIContract = getContract({
    client,
    chain: arbitrumSepolia,
    address: process.env.NEXT_PUBLIC_UNSPARKINGAI_PROXY as string,
});

import { useReadContract } from "thirdweb/react";
import { getContract, toEther } from "thirdweb";
import { arbitrumSepolia } from "thirdweb/chains";
import SparkAgentLogo from "./SparkAgentLogo";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

const Agents = () => {
    const [index, setIndex] = useState(0);
    const [address, setAddress] = useState<string>("");
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

    const { data: gradThreshold } = useReadContract({
        contract: unsparkingAIContract,
        method: "function gradThreshold() returns (uint256)",
        params: [],
    });

    useEffect(() => {
        if (data) {
            setIndex((prevIndex) => prevIndex + 1);
            setAddress(data.toString());
        }
    }, [data]);

    useEffect(() => {
        if (agentData !== undefined) {
            console.log("Agent data:", agentData);
            const certificate = agentData[1].toString();
            if (certificate !== "0x0000000000000000000000000000000000000000") {
                const parsedData: AgentData = {
                    creator: agentData[0].toString(),
                    certificate: certificate,
                    pair: agentData[2].toString(),
                    agentToken: agentData[3].toString(),
                    token: agentData[4][0].toString(),
                    tokenName: agentData[4][1].toString(),
                    _tokenName: agentData[4][2].toString(),
                    tokenTicker: agentData[4][3].toString(),
                    supply: parseInt(agentData[4][4].toString()),
                    price: parseInt(agentData[4][5].toString()),
                    marketCap: parseInt(toEther(agentData[4][6])), // todo: further convert to USD
                    liquidity: parseInt(agentData[4][7].toString()),
                    volume: parseInt(agentData[4][8].toString()),
                    volume24H: parseInt(agentData[4][9].toString()),
                    prevPrice: parseInt(agentData[4][10].toString()),
                    lastUpdated: new Date(parseInt(agentData[4][11].toString()) * 1000),
                    description: agentData[5].toString(),
                    image: agentData[6].toString(),
                    twitter: agentData[7].toString(),
                    telegram: agentData[8].toString(),
                    youtube: agentData[9].toString(),
                    website: agentData[10].toString(),
                    trading: agentData[11].valueOf(),
                    tradingOnUniSwap: agentData[12]?.valueOf(),
                    gradThreshold: gradThreshold ?? BigInt(0),
                };
                setAgentsData((prevAgentsData) => [...prevAgentsData, parsedData]);
            }
        }
    }, [agentData]);    

    useEffect(() => {
        if (index > 0 && !data) {
            console.log("No more addresses found");
        }
    }, [index, data]);

    const [searchQuery, setSearchQuery] = useState("");
    const [filteredAgents, setFilteredAgents] = useState<AgentData[]>([]);

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

    useEffect(() => {
        setFilteredAgents(agentsData);
    }, [agentsData]);

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

                    {/* Agent Cards */}
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
                                        pairAddress={agent.pair}
                                        trading={agent.trading}
                                        gradThreshold={agent.gradThreshold}
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
                </div>
            </div>
        </section>
    );
};

export default Agents;