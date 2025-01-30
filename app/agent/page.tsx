"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AgentStats from "../components/AgentStats";
import SwapCard from "../components/SwapCard";
import SparkingProgressCard from "../components/SparkingProgressCard";
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
import { AGENTS } from "../lib/utils/agents-sample-data";

const AgentPage = () => {
  const searchParams = useSearchParams();
  const certificate = searchParams.get("certificate");

  const { data: agentData } = useReadContract({
    contract: unsparkingAIContract,
    method: "function tokenInfo(address) returns (address, address, address, address, (address, string, string, string, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256), string, string, string, string, string, string, bool, bool)",
    params: [certificate || ""],
  });

  interface AgentData {
    creator: string,
    certificate: string,
    pair: string,
    agentToken: string,
    token: string,
    tokenName: string,
    _tokenName: string,
    tokenTicker: string,
    supply: number,
    price: number,
    marketCap: number,
    liquidity: number,
    volume: number,
    volume24H: number,
    prevPrice: number,
    lastUpdated: Date,
    description: string,
    image: string,
    twitter: string,
    telegram: string,
    youtube: string,
    website: string,
    trading: boolean,
    tradingOnUniSwap: boolean,
}

  const [agent, setAgent] = useState<AgentData>();

  useEffect(() => {
    if (agentData) {
        console.log("Raw agent data:", agentData);
        const parsedData: AgentData = {
            creator: agentData[0].toString(),
            certificate: agentData[1].toString(),
            pair: agentData[2].toString(),
            agentToken: agentData[3].toString(),
            token: agentData[4][0].toString(),
            tokenName: agentData[4][1].toString(),
            _tokenName: agentData[4][2].toString(),
            tokenTicker: agentData[4][3].toString(),
            supply: parseInt(agentData[4][4].toString()),
            price: parseInt(agentData[4][5].toString()),
            marketCap: parseInt(agentData[4][6].toString()),
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
        };
        console.log("Parsed agent data:", parsedData);
        setAgent(parsedData);
    }
}, [agentData]);

  return (
    <div className="items-center justify-center min-h-screen m-6 lg:mx-2 xl:mx-10 2xl:mx-24 mt-16 md:mt-28">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
        
        {/* First Column */}
        <div className="lg:col-span-2 w-full">
          {agent && (
            <AgentStats
              title={agent._tokenName}
              ticker={agent.tokenTicker}
              image={AGENTS[0].image}
              imageAlt={agent.tokenName}
              certificate={agent.certificate}
              description={agent.description}
              createdBy={agent.creator}
              marketCap={agent.marketCap}
              datePublished={new Date(agent.lastUpdated)}
              sparkingProgress={agent.trading ? 50 : 0}
              tokenPrice={agent.price}
              website={agent.website}
              twitter={agent.twitter}
              telegram={agent.telegram}
              youtube={agent.youtube}
            />
          )}
        </div>

        {/* Second Column */}
				<div className="flex flex-col gap-4">
					<SwapCard />
          <SparkingProgressCard sparkingProgress={agent?.trading ? 50 : 0} />
				</div>
			</div>
		</div>
	);
}

export default AgentPage;