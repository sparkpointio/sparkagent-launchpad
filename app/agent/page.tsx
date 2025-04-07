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
import { readContract, getContract, toEther } from "thirdweb";
import { selectedChain } from "../lib/chain-thirdweb";
import { getSparkingProgress } from "@/app/lib/utils/formatting";
import NotFound from "@/app/components/ui/not-found";
import Violation from "@/app/components/ui/violation";
import Forums from "../components/Forums";

import { IconLoader2 } from "@tabler/icons-react";
import { motion } from "framer-motion";
import AgentFunctionalityCard from "../components/AgentFunctionalityCard";

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
  reserves: [bigint, bigint];
  totalSupply: bigint;
  gradThreshold: bigint;
  initialLiquidity: bigint;
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
  ],
  status: number
}

const AgentPage = () => {
  const searchParams = useSearchParams();
  const certificate = searchParams.get("certificate");

  const [agent, setAgent] = useState<AgentData>();
  const [isLoading, setIsLoading] = useState(true);
  const [agentDataFromAPI, setAgentDataFromAPI] = useState<RawAgentData | null>(null);

  const unsparkingAIContract = getContract({
    client,
    chain: selectedChain,
    address: process.env.NEXT_PUBLIC_UNSPARKINGAI_PROXY as string,
  });

  const { data: agentData } = useReadContract({
    contract: unsparkingAIContract,
    method: "function tokenInfo(address) returns (address, address, address, address, (address, string, string, string, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256), string, string, string, string, string, string, bool, bool)",
    params: [certificate || ""],
  });

  const { data: gradThreshold } = useReadContract({
    contract: unsparkingAIContract,
    method: "function gradThreshold() returns (uint256)",
    params: [],
  });

  const { data: initialLiquidity } = useReadContract({
    contract: unsparkingAIContract,
    method: "function L() returns (uint256)",
    params: [],
  });

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        if (agentData) {
          console.log("Raw agent data:", agentData);

          const agentPairContract = getContract({
            client,
            chain: selectedChain,
            address: agentData[2].toString(),
          });

          const tokenContract = getContract({
            client,
            chain: selectedChain,
            address: agentData[1].toString(),
          });

          const reserves = await readContract({
            contract: agentPairContract,
            method: "function getReserves() returns (uint256, uint256)",
            params: [],
          });

          const totalSupply = await readContract({
            contract: tokenContract,
            method: "function totalSupply() returns (uint256)",
            params: [],
          });

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
            marketCap: parseInt(toEther(agentData[4][6])),
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
            reserves: [reserves[0], reserves[1]],
            totalSupply,
            gradThreshold: gradThreshold ?? BigInt(0),
            initialLiquidity: initialLiquidity ?? BigInt(0)
          };

          const response = await fetch(`/api/tokens/${certificate}`);
          const result = await response.json();

          if (result.data && JSON.stringify(result.data) !== JSON.stringify(agentDataFromAPI)) {
            setAgentDataFromAPI(result.data);
          }

          console.log("AGENT CERTIFICATE: " + agentData[1].toString());
          console.log("AGENT PAIR ADDRESS: " + agentData[2].toString());
          console.log("RESERVE A: " + parsedData.reserves[1]);

          setAgent(parsedData);

          console.log("RESERVE A: " + parsedData.reserves[1]);
        } else {
          if (gradThreshold && initialLiquidity && !agentDataFromAPI) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching reserves:", error);
      } finally {
        if (agentData && gradThreshold && initialLiquidity && agentDataFromAPI)
        {
          setIsLoading(false);
        }
      }
    };

    fetchAgentData();
  }, [agentData, gradThreshold, initialLiquidity, agentDataFromAPI, certificate]);

  return (
    <div className="flex items-center justify-center min-h-screen p-6 lg:px-2 xl:px-10 2xl:px-24 pt-16 md:pt-28">
      {isLoading ? (
        <div className="flex items-center justify-center h-[80vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center mb-1">
              <IconLoader2 size={64} className="animate-spin"/>
            </div>
            <span className="text-xl">
              Loading Agent Data...
            </span>
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
          {!agent ? (
            <div className="col-span-3">
              <NotFound />
            </div>
          ) : (
              agentDataFromAPI && agentDataFromAPI.status == 1 ?
              <>
                {/* First Column */}
                <div className="lg:col-span-2 w-full space-y-4">
                  <AgentStats
                    certificate={agent.certificate}
                    image={agent.image}
                    tokenName={agent._tokenName}
                    ticker={agent.tokenTicker}
                    agentData={agentDataFromAPI}
                  />

                  <div className="hidden md:block w-full space-y-4">
                    <Forums
                      agentCertificate={agent.certificate}
                      agentName={agent._tokenName}
                      agentImage={agent.image}
                    />
                  </div>
                </div>

                {/* Second Column */}
                <div className="flex flex-col gap-4">
                  <SwapCard
                    contractAddress={agent.certificate}
                    ticker={agent.tokenTicker}
                    image={agent.image}
                    trading={agent.trading}
                  />

                  <SparkingProgressCard
                      sparkingProgress={agent?.reserves[1] ? getSparkingProgress(agent.reserves[1], agent.gradThreshold, agent.initialLiquidity) : 0}
                      gradThreshold={agent.gradThreshold}
                      trading={agent.trading}
                      contractAddress={agent.certificate}
                  />

                  <AgentFunctionalityCard 
                    sparkingProgress={agent?.reserves[1] ? getSparkingProgress(agent.reserves[1], agent.gradThreshold, agent.initialLiquidity) : 0}
                    certificate={agent.certificate}
                    creator={agent.creator}
                    hasGraduated={agent.tradingOnUniSwap}
                    tokenName={agent.tokenName}
                    tokenTicker={agent.tokenTicker}
                    tokenDescription={agent.description}
                    tokenImage={agent.image}
                  />

                  <div className="md:hidden w-full space-y-4">
                    <Forums
                      agentCertificate={agent.certificate}
                      agentName={agent._tokenName}
                      agentImage={agent.image}
                    />
                  </div>
                </div>
              </>
              :
              <div className="col-span-3">
                <Violation />
              </div>
          )}
        </div>
      )}
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