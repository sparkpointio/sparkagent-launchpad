"use client";

import Image from "next/image";
import { new_sparkpoint_logo } from "../lib/assets";
import { motion } from "framer-motion";
import { useState } from "react";
import { prepareContractCall, getContract } from "thirdweb";
import {client} from "@/app/client";
import {arbitrumSepolia} from "thirdweb/chains";
import {useActiveAccount, useSendTransaction, useReadContract} from "thirdweb/react";

const unsparkingAIContract = getContract({
    client,
    chain: arbitrumSepolia,
    address: process.env.NEXT_PUBLIC_UNSPARKINGAI_PROXY as string,
});

const srkContract = getContract({
    client,
    chain: arbitrumSepolia,
    address: process.env.NEXT_PUBLIC_SRK_TOKEN as string,
});

const factoryContract = getContract({
    client,
    chain: arbitrumSepolia,
    address: process.env.NEXT_PUBLIC_FFACTORY as string,
});

const pairContract = getContract({
    client,
    chain: arbitrumSepolia,
    address: process.env.NEXT_PUBLIC_FPAIR as string,
});

interface SwapCardProps {
    contractAddress: string;
    ticker: string;
    image: string;
}

const SwapCard: React.FC<SwapCardProps> = ({ contractAddress, ticker, image }) => {
    const { mutate: sendTransaction } = useSendTransaction();

    const [swapType, setSwapType] = useState<"buy" | "sell">("buy");
    const [amount, setAmount] = useState("");

    const headerProperties = "flex text-xl justify-right";
    const buttonProperties = "w-full border-2 border-black dark:border-gray-600 dark:bg-gray-800 rounded-3xl hover:bg-sparkyGreen-500 dark:hover:bg-sparkyGreen-600 transition-all p-4";
    const activeButton = "bg-sparkyGreen-500 dark:bg-sparkyGreen-600 text-white";

    const unsparkedTokenContract = getContract({
        client,
        chain: arbitrumSepolia,
        address: contractAddress,
    });

    const account = useActiveAccount();
    if (!account) {
        alert("Please connect your wallet first.");
        return;
    }

    const { data: unsparkingAIContractAllowanceForSRKTemp } = useReadContract({
        contract: srkContract,
        method: "function allowance(address owner, address spender) returns (uint256)",
        params: [account.address, unsparkingAIContract.address],
    });

    const { data: factoryContractAllowanceForSRKTemp } = useReadContract({
        contract: srkContract,
        method: "function allowance(address owner, address spender) returns (uint256)",
        params: [account.address, factoryContract.address],
    });

    const { data: pairContractAllowanceForSRKTemp } = useReadContract({
        contract: srkContract,
        method: "function allowance(address owner, address spender) returns (uint256)",
        params: [account.address, pairContract.address],
    });

    const unsparkingAIContractAllowanceForSRK = BigInt(unsparkingAIContractAllowanceForSRKTemp ?? "0");
    const factoryContractAllowanceForSRK = BigInt(factoryContractAllowanceForSRKTemp ?? "0");
    const pairContractAllowanceForSRK = BigInt(pairContractAllowanceForSRKTemp ?? "0");

    const { data: unsparkingAIContractAllowanceForUnsparkedTokenTemp } = useReadContract({
        contract: srkContract,
        method: "function allowance(address owner, address spender) returns (uint256)",
        params: [account.address, unsparkingAIContract.address],
    });

    const { data: factoryContractAllowanceForUnsparkedTokenTemp } = useReadContract({
        contract: srkContract,
        method: "function allowance(address owner, address spender) returns (uint256)",
        params: [account.address, factoryContract.address],
    });

    const { data: pairContractAllowanceForUnsparkedTokenTemp } = useReadContract({
        contract: srkContract,
        method: "function allowance(address owner, address spender) returns (uint256)",
        params: [account.address, pairContract.address],
    });

    const unsparkingAIContractAllowanceForUnsparkedToken = BigInt(unsparkingAIContractAllowanceForUnsparkedTokenTemp ?? "0");
    const factoryContractAllowanceForUnsparkedToken = BigInt(factoryContractAllowanceForUnsparkedTokenTemp ?? "0");
    const pairContractAllowanceForUnsparkedToken = BigInt(pairContractAllowanceForUnsparkedTokenTemp ?? "0");

    const getParsedAmount = () => {
        return BigInt(amount || "0") * BigInt("1000000000000000000"); // Convert to Wei
    };

    const approveIfNeeded = (contractAddress: string, allowance: bigint, nextApproval?: () => void) => {
        if (allowance < getParsedAmount()) {
            console.log({
                contract: swapType === "buy" ? srkContract : unsparkedTokenContract,
                method: "function approve(address spender, uint256 value)",
                params: [contractAddress, getParsedAmount()],
                value: BigInt(0),
            })

            const approveTx = prepareContractCall({
                contract: swapType === "buy" ? srkContract : unsparkedTokenContract,
                method: "function approve(address spender, uint256 value)",
                params: [contractAddress, getParsedAmount()],
                value: BigInt(0),
            });

            console.log(`Prepared approval transaction for contract: ${contractAddress}`, approveTx);

            sendTransaction(approveTx, {
                onError: (error) => {
                    console.error(`Approval failed for ${contractAddress}:`, error);
                },
                onSuccess: () => {
                    console.log(`Approval successful for ${contractAddress}!`);
                    if (nextApproval) nextApproval();
                    else {
                        console.log("All approvals completed. Proceeding with swap.");
                        proceedWithSwap();
                    }
                },
            });
        } else {
            console.log(`Sufficient allowance already granted for ${contractAddress}.`);
            if (nextApproval) nextApproval();
            else {
                console.log("All approvals completed. Proceeding with swap.");
                proceedWithSwap();
            }
        }
    };

    const handleSwap = async () => {
        if (!amount || BigInt(amount) <= 0) {
            console.error("Invalid amount");
            return;
        }

        console.log("Approval 1 Checked");
        approveIfNeeded(unsparkingAIContract.address, swapType === "buy" ? unsparkingAIContractAllowanceForSRK : unsparkingAIContractAllowanceForUnsparkedToken, () => {
            console.log("Approval 2 Checked");
            approveIfNeeded(factoryContract.address, swapType === "buy" ? factoryContractAllowanceForSRK : factoryContractAllowanceForUnsparkedToken, () => {
                console.log("Approval 3 Checked");
                approveIfNeeded(pairContract.address, swapType === "buy" ? pairContractAllowanceForSRK : pairContractAllowanceForUnsparkedToken);
            });
        });
    };

    const proceedWithSwap = () => {
        try {
            const swapMethod =
                swapType === "buy"
                    ? "function buy(uint256 amountIn, address tokenAddress)"
                    : "function sell(uint256 amountIn, address tokenAddress)";

            const swapTx = prepareContractCall({
                contract: unsparkingAIContract,
                method: swapMethod,
                params: [getParsedAmount(), contractAddress],
                value: BigInt(0),
            });

            console.log("Prepared swap transaction:", swapTx);

            sendTransaction(swapTx, {
                onError: (error) => {
                    console.error("Swap transaction failed:", error);
                },
                onSuccess: () => {
                    console.log("Swap transaction successful!");
                },
            });
        } catch (error) {
            console.error("Error executing swap transaction:", error);
        }
    };

    return (
        <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}}
                    className="bg-white dark:bg-[#1a1d21] dark:text-white h-min border-2 border-black rounded-2xl shadow-md p-5 m:p-6">
            <h2 className={`${headerProperties} font-bold mb-4`}>Swap</h2>
            <div className="flex flex-row gap-4 mb-12">
                <button
                    type="button"
                    className={`${buttonProperties} ${swapType === "buy" ? activeButton : ""}`}
                    onClick={() => setSwapType("buy")}
                >
                    Buy
                </button>
                <button
                    type="button"
                    className={`${buttonProperties} ${swapType === "sell" ? activeButton : ""}`}
                    onClick={() => setSwapType("sell")}
                >
                    Sell
                </button>
            </div>
            <div
                className="relative flex items-center bg-gray-200 dark:placeholder-gray-400 dark:bg-gray-700 p-2 rounded-lg mb-12">
                <input
                    type="number"
                    title="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Enter amount in ${swapType === "buy" ? "SRK" : ticker}`}
                    className="flex-1 px-4 py-3 w-full rounded-lg focus:outline-none focus:ring focus:ring-gray bg-transparent"
                />
                <Image
                    src={swapType === "buy" ? new_sparkpoint_logo : image}
                    alt={`${swapType === "buy" ? "SparkPoint" : ticker} Logo`}
                    className="absolute right-4"
                    width={32}
                    height={32}
                />
            </div>
            <button type="button" className={buttonProperties} onClick={handleSwap}> Swap</button>
        </motion.div>
    );
};

export default SwapCard;