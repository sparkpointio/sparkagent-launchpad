"use client";

import { motion } from "framer-motion";
import { cardProperties } from "../lib/utils/style/customStyles";
import { IconBrandTelegram, IconBrandX, IconChartLine, IconMessageChatbot } from "@tabler/icons-react";
import { AgentConfiguration } from "./AgentConfiguration";
import { useState } from "react";

interface AgentFunctionalityCardProps {
    sparkingProgress: number;
    certificate: string;
    creator: string;
    hasGraduated: boolean;
    tokenName: string;
    tokenTicker: string;
    tokenDescription: string;
    tokenImage: string;
}

const headerProperties = "flex text-3xl justify-right font-bold";
const pendingProperties = "text-sm sm:text-md font-thin italic";
const runningProperties = "text-sm sm:text-md font-bold";
const functionalityProperties = "text-sm sm:text-md font-bold";
const agentConfigButtonProperties = "w-full border-2 border-black dark:border-gray-600 dark:bg-gray-800 rounded-3xl hover:bg-sparkyOrange-500 dark:hover:bg-sparkyOrange-600 transition-all p-4";

const renderFunctionality = (Icon: React.ElementType, name: string, description: string, status: "Running" | "Coming Soon"  | "Pending Activation") => {
    const statusProperties = status === "Running" ? runningProperties : pendingProperties;

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center max-w-[65%]">
                <Icon size={46} />
                <div className="flex flex-col ml-2">
                    <p className={functionalityProperties}>{name}</p>
                    <p className="text-sm">{description}</p>
                </div>
            </div>
            <p className={statusProperties}>{status}</p>
        </div>
    );
};

const AgentFunctionalityCard: React.FC<AgentFunctionalityCardProps> = ({
    sparkingProgress,
    certificate,
    creator,
    hasGraduated,
    tokenName,
    tokenTicker,
    tokenDescription,
    tokenImage,
}) => {
    const [isAgentConfigOpen, setIsAgentConfigOpen] = useState(false);
    const [isXAgentActive, setIsXAgentActive] = useState(false);
    
    const sparked = sparkingProgress >= 100;

    const isXAgentReady = true;
    const isTelegramAgentReady = false;
    const isTradingAgentReady = false;

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cardProperties + " space-y-4 lg:space-y-6"}>
            <div className="flex items-center">
                <h2 className={`${headerProperties} mr-2 text-[1.6em]`}>Functionality</h2>
            </div>
            <div className="flex flex-col space-y-4">
                {renderFunctionality(IconMessageChatbot, "Forum Agent", "Interact with the Agent", "Running")}
                {renderFunctionality(IconBrandX, "Agentic X Agent", "Agent comes alive on X", sparked ? "Coming Soon" : isXAgentReady ? isXAgentActive ? "Running" : "Pending Activation" : "Coming Soon")}
                {renderFunctionality(IconBrandTelegram, "Agentic Telegram Agent", "Agent comes alive on Telegram", sparked ? "Coming Soon" : isTelegramAgentReady ? "Pending Activation" : "Coming Soon")}
                {renderFunctionality(IconChartLine, "Trading Agent", "Agent autonomously trading", sparked ? "Coming Soon" : isTradingAgentReady ? "Pending Activation" : "Coming Soon")}
            </div>
            <button
                type="button"
                onClick={() => setIsAgentConfigOpen(true)}
                className={agentConfigButtonProperties}
            >
                Agent Config
            </button>
            <AgentConfiguration
                agentName={tokenName}
                ticker={tokenTicker}
                description={tokenDescription}
                certificate={certificate}
                creator={creator}
                hasGraduated={hasGraduated}
                image={tokenImage}
                isOpen={isAgentConfigOpen}
                onClose={() => setIsAgentConfigOpen(false)}
            />
        </motion.div>
    );
};

export default AgentFunctionalityCard;
