"use client";

import Image from "next/image";
import { new_sparkpoint_logo } from "../lib/assets";
import { motion } from "framer-motion";
import {useEffect, useState} from "react";
import { prepareContractCall, getContract } from "thirdweb";
import {client} from "@/app/client";
import {arbitrumSepolia} from "thirdweb/chains";
import {useActiveAccount, useSendTransaction} from "thirdweb/react";
import {readContract} from "thirdweb";
import blockies from "ethereum-blockies";
import WalletConfirmationStatus from "../components/WalletConfirmationStatus";

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

    const [imgSrc, setImgSrc] = useState(new_sparkpoint_logo.src);
    const [walletConfirmationStatus, setWalletConfirmationStatus] = useState(0);

    const [swapType, setSwapType] = useState<"buy" | "sell">("buy");
    const [swapTransactionHash, setSwapTransactionHash] = useState("");

    const blockiesIcon = blockies.create({ seed: contractAddress, size: 16, scale: 8 });

    useEffect(() => {
        setImgSrc(swapType === "buy" ? new_sparkpoint_logo.src : `https://aquamarine-used-bear-228.mypinata.cloud/ipfs/${image}`);
    }, [swapType, image]);

    const [amount, setAmount] = useState("");

    const headerProperties = "flex text-xl justify-right";
    const buttonProperties = "w-full border-2 border-black dark:border-gray-600 dark:bg-gray-800 rounded-3xl hover:bg-sparkyGreen-500 dark:hover:bg-sparkyGreen-600 transition-all p-4";
    const activeButton = "bg-sparkyGreen-500 dark:bg-sparkyGreen-600 text-white";

    const srkBalance = "2,935.35";
    const agentBalance = "1,833,435.45";

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
                    setWalletConfirmationStatus(0)
                    console.error(`Approval failed for ${contractAddress}:`, error);
                },
                onSuccess: () => {
                    console.log(`Approval successful for ${contractAddress}!`);
                    if (nextApproval) nextApproval();
                    else {
                        console.log("All approvals completed. Proceeding with swap.");
                        setWalletConfirmationStatus(4);
                        proceedWithSwap();
                    }
                },
            });
        } else {
            console.log(`Sufficient allowance already granted for ${contractAddress}.`);
            if (nextApproval) nextApproval();
            else {
                console.log("All approvals completed. Proceeding with swap.");
                setWalletConfirmationStatus(4);
                proceedWithSwap();
            }
        }
    };

        const handleSwap = async () => {
        if (!amount || BigInt(amount) <= 0) {
          console.error("Invalid amount");
          toast.warning("Invalid amount");
          return
        }

        console.log("Fetching latest allowances...");

        try {
            // Fetch latest allowances before approving transactions
            const contract = (swapType === "buy") ? srkContract : unsparkedTokenContract;

            console.log("Approval 1 Checked");
            setWalletConfirmationStatus(1);

            const unsparkingAIAllowance = await readContract({
                contract: contract,
                method: "function allowance(address owner, address spender) returns (uint256)",
                params: [account.address, unsparkingAIContract.address],
            });

            const updatedUnsparkingAIAllowance = BigInt(unsparkingAIAllowance ?? "0");

            approveIfNeeded(unsparkingAIContract.address, updatedUnsparkingAIAllowance, async () => {
                console.log("Approval 2 Checked");
                setWalletConfirmationStatus(2);

                const factoryAllowance = await readContract({
                    contract: contract,
                    method: "function allowance(address owner, address spender) returns (uint256)",
                    params: [account.address, factoryContract.address],
                });

                const updatedFactoryAllowance = BigInt(factoryAllowance ?? "0");

                approveIfNeeded(factoryContract.address, updatedFactoryAllowance, async () => {
                    console.log("Approval 3 Checked");
                    setWalletConfirmationStatus(3);

                    const pairAllowance = await readContract({
                        contract: contract,
                        method: "function allowance(address owner, address spender) returns (uint256)",
                        params: [account.address, pairContract.address],
                    });

                    const updatedPairAllowance = BigInt(pairAllowance ?? "0");

                    approveIfNeeded(pairContract.address, updatedPairAllowance);
                });
            });
        } catch (error) {
            console.error("Error fetching allowances:", error);
        }
    };

    const proceedWithSwap = () => {
        try {
            const swapMethod =
                swapType === "buy"
                    ? "function buy(uint256 amountIn, address tokenAddress)"
                    : "function sell(uint256 amountIn, address tokenAddress)";

            console.log([getParsedAmount(), contractAddress]);

            const swapTx = prepareContractCall({
                contract: unsparkingAIContract,
                method: swapMethod,
                params: [getParsedAmount(), contractAddress],
                value: BigInt(0),
            });

            console.log("Prepared swap transaction:", swapTx);

            sendTransaction(swapTx, {
                onError: (error) => {
                    setWalletConfirmationStatus(0)
                    console.error("Swap transaction failed:", error);
                },
                onSuccess: (tx) => {
                    setWalletConfirmationStatus(5);
                    setSwapTransactionHash(tx?.transactionHash);

                    console.log("Swap transaction successful!");
                    console.log("Transaction Hash:", tx?.transactionHash);
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
            <div className="flex flex-row gap-4">
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
            {swapType === "buy" && (
                <p className="text-sm text-gray-800 dark:text-gray-200">
                    You&apos;ll need $SRK to buy {ticker}
                </p>
            )}
            <div className="relative flex flex-col gap-4 mb-12">
                <div className="flex items-center bg-gray-200 dark:bg-gray-700 dark:placeholder-gray-400 p-2 rounded-lg">
                    <input
                        type="number"
                        title="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Enter amount in ${swapType === "buy" ? "SRK" : ticker}`}
                        className="flex-1 px-4 py-3 w-full rounded-lg focus:outline-none focus:ring focus:ring-gray bg-transparent"
                    />
                    <Image
                        src={imgSrc}
                        alt={`${swapType === "buy" ? "SparkPoint" : ticker} Logo`}
                        className="absolute right-4"
                        onError={() => {
                            setImgSrc(blockiesIcon.toDataURL());
                        }}
                        width={32}
                        height={32}
                    />
                </div>

                {/* Quick action buttons and balance */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setAmount("")}
                            className="text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => {
                                const balance =
                                    swapType === "buy"
                                        ? Number.parseFloat(srkBalance.replace(/,/g, ""))
                                        : Number.parseFloat(agentBalance.replace(/,/g, ""))
                                setAmount((balance * 0.25).toString())
                            }}
                            className="text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                        >
                            25%
                        </button>
                        <button
                            onClick={() => {
                                const balance =
                                    swapType === "buy"
                                        ? Number.parseFloat(srkBalance.replace(/,/g, ""))
                                        : Number.parseFloat(agentBalance.replace(/,/g, ""))
                                setAmount((balance * 0.5).toString())
                            }}
                            className="text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                        >
                            50%
                        </button>
                        <button
                            onClick={() => {
                                const balance =
                                    swapType === "buy"
                                        ? Number.parseFloat(srkBalance.replace(/,/g, ""))
                                        : Number.parseFloat(agentBalance.replace(/,/g, ""))
                                setAmount(balance.toString())
                            }}
                            className="text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                        >
                            Max
                        </button>
                    </div>
                    <div className="text-gray-800 dark:text-gray-200">
                        {swapType === "buy" ? `${srkBalance} SRK` : `${agentBalance} ${ticker}`}
                    </div>
                </div>
            </div>

            <button type="button" className={buttonProperties} onClick={handleSwap}> Swap</button>

            <WalletConfirmationStatus
                walletConfirmationStatus={walletConfirmationStatus}
                swapType={swapType}
                ticker={ticker}
                setWalletConfirmationStatus={setWalletConfirmationStatus}
            />
    </motion.div>
  )
}

export default SwapCard;