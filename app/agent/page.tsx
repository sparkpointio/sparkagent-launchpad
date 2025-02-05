"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AgentStats from "@/app/components/AgentStats";
import SwapCard from "@/app/components/SwapCard";
import SparkingProgressCard from "@/app/components/SparkingProgressCard";
import { client } from "@/app/client";
import {
  useReadContract,
} from "thirdweb/react";
import { getContract, toEther } from "thirdweb";
import { arbitrumSepolia } from "thirdweb/chains";
import { getSparkingProgress } from "@/app/lib/utils/formatting";
import NotFound from "@/app/components/ui/not-found";

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
  srkHoldings: bigint;
}

const AgentPage = () => {
  const searchParams = useSearchParams();
  const certificate = searchParams.get("certificate");

  const [pairAddress, setPairAddress] = useState<string>("");
  const [agent, setAgent] = useState<AgentData>();

  const unsparkingAIContract = getContract({
    client,
    chain: arbitrumSepolia,
    address: process.env.NEXT_PUBLIC_UNSPARKINGAI_PROXY as string,
  });

  const { data: agentData } = useReadContract({
    contract: unsparkingAIContract,
    method: "function tokenInfo(address) returns (address, address, address, address, (address, string, string, string, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256), string, string, string, string, string, string, bool, bool)",
    params: [certificate || ""],
  });

  const srkToken = getContract({
    client,
    chain: arbitrumSepolia,
    address: process.env.NEXT_PUBLIC_SRK_TOKEN as string,
  });

  const { data: srkHoldings } = useReadContract({
    contract: srkToken,
    method: "function balanceOf(address) returns (uint256)",
    params: [pairAddress], // use dynamic pair address from agent
  });

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
        marketCap: parseInt(toEther(agentData[4][6])),  // todo: further convert to USD
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
        srkHoldings: srkHoldings ?? BigInt(0), // Set SRK holdings for agent
      };
      console.log("AGENT CERTIFICATE: " + agentData[1].toString());
      console.log("AGENT PAIR ADDRESS: " + agentData[2].toString());
      console.log("SRK HOLDINGS: " + parsedData.srkHoldings);
      setPairAddress(agentData[2].toString());
      setAgent(parsedData);
      console.log("SRK HOLDINGS: " + parsedData.srkHoldings);
    }
  }, [agentData, srkHoldings]);

  return (
    <div className="items-center justify-center min-h-screen m-6 lg:mx-2 xl:mx-10 2xl:mx-24 mt-16 md:mt-28">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
        {!agent && (
          <div className="col-span-3">
            <NotFound />
          </div>
        )}    
        {/* First Column */}
        <div className="lg:col-span-2 w-full space-x-1.5">
          {agent && (
            <AgentStats
              title={agent._tokenName}
              ticker={agent.tokenTicker}
              image={agent.image}
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
              pair={agent.pair}
            />
          )}
        </div>

        {/* Second Column */}
				<div className="flex flex-col gap-4">
          {agent && (
              <>
                <SwapCard
                    contractAddress={agent.certificate}
                    ticker={agent.tokenTicker}
                    image={agent.image}
                />

                <SparkingProgressCard sparkingProgress={agent?.srkHoldings ? getSparkingProgress(agent.srkHoldings) : 0} />
              </>
          )}
				</div>
			</div>
		</div>
	);
}

const Page = () => {
  return (
    <Suspense>
      <AgentPage />
    </Suspense>
  )
}

export default Page;