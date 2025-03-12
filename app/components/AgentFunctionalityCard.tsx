"use client";

import { motion } from "framer-motion";
import { cardProperties } from "../lib/utils/style/customStyles";
import { IconBrandTelegram, IconBrandX, IconMessageChatbot } from "@tabler/icons-react";

interface AgentFunctionalityCardProps {
    sparkingProgress: number;
    gradThreshold: bigint;
    trading: boolean;
    contractAddress: string;
}

const headerProperties = "flex text-3xl justify-right font-bold";
const pendingProperties = "text-sm sm:text-md font-thin italic";
const runningProperties = "text-sm sm:text-md font-bold";
const functionalityProperties = "text-sm sm:text-md font-bold";

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
}) => {
    
    const sparked = sparkingProgress >= 100;

    const AgenticXAgentReady = false;
    const AutoReplyXAgentReady = false;
    const AgenticTelegramAgentReady = false;

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cardProperties + " space-y-4 lg:space-y-6"}>
            <div className="flex items-center">
                <h2 className={`${headerProperties} mr-2 text-[1.6em]`}>Functionality</h2>
            </div>
            <div className="flex flex-col space-y-4">
                {renderFunctionality(IconMessageChatbot, "Forum Agent", "Interact with the Agent", "Running")}
                {renderFunctionality(IconBrandX, "Agentic X Agent", "Agent comes alive on X", sparked ? "Coming Soon" : AgenticXAgentReady ? "Pending Activation" : "Coming Soon")}
                {renderFunctionality(IconBrandX, "Auto Reply X Agent", "Agent auto replies on X", sparked ? "Coming Soon" : AutoReplyXAgentReady ? "Pending Activation" : "Coming Soon")}
                {renderFunctionality(IconBrandTelegram, "Agentic Telegram Agent", "Agent comes alive on Telegram", sparked ? "Coming Soon" : AgenticTelegramAgentReady ? "Pending Activation" : "Coming Soon")}
            </div>
        </motion.div>
    );
};

export default AgentFunctionalityCard;
