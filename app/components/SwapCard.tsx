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
import { toEther, toWei } from "thirdweb";
import blockies from "ethereum-blockies";
import WalletConfirmationStatus from "../components/WalletConfirmationStatus";
import { getFormattedEther } from "../lib/utils/formatting";
import Link from "next/link";
import { cardProperties } from "../lib/utils/style/customStyles";

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
    trading: boolean;
}

const SwapCard: React.FC<SwapCardProps> = ({ contractAddress, ticker, image, trading }) => {
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
    const buyButtonProperties = "w-full border-2 border-black dark:border-gray-600 dark:bg-gray-800 rounded-3xl hover:bg-sparkyGreen-500 dark:hover:bg-sparkyGreen-600 transition-all p-4";
    const sellButtonProperties = "w-full border-2 border-black dark:border-gray-600 dark:bg-gray-800 rounded-3xl hover:bg-sparkyRed-500 dark:hover:bg-sparkyRed-600 transition-all p-4";
    const swapButtonProperties = "w-full border-2 border-black dark:border-gray-600 dark:bg-gray-800 rounded-3xl hover:bg-sparkyOrange-500 dark:hover:bg-sparkyOrange-600 transition-all p-4";
    const activeBuyButton = "bg-sparkyGreen-500 dark:bg-sparkyGreen-600 text-white";
    const activeSellButton = "bg-sparkyRed-500 dark:bg-sparkyRed-600 text-white";

    const [srkBalance, setSRKBalance] = useState("");
    const [agentBalance, setAgentBalance] = useState("");

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

    const getAccountBalances = async () => {
        const accountSRKBalance = await readContract({
            contract: srkContract,
            method: "function balanceOf(address account) returns (uint256)",
            params: [account.address],
        });

        setSRKBalance(BigInt(accountSRKBalance ?? "0").toString());

        console.log("Account SRK Balance: " + BigInt(accountSRKBalance ?? "0").toString());

        const accountAgentBalance = await readContract({
            contract: unsparkedTokenContract,
            method: "function balanceOf(address account) returns (uint256)",
            params: [account.address],
        });

        setAgentBalance(BigInt(accountAgentBalance ?? "0").toString());

        console.log("Account Agent Balance: " + BigInt(accountAgentBalance ?? "0").toString());
    };

    const getParsedAmount = () => {
        return toWei(amount || "0")
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
        if (!amount || Number(toWei(amount)) <= 0) {
          console.error("Invalid amount");
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

    getAccountBalances();

    return (
        <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} className={cardProperties}>
            <h2 className={`${headerProperties} font-bold mb-4`}>Swap</h2>
            <div className="flex flex-row gap-4 mb-4">
                <button
                    type="button"
                    className={`${buyButtonProperties} ${swapType === "buy" ? activeBuyButton : ""} ${!trading ? 'cursor-not-allowed' : ''}`}
                    onClick={() => setSwapType("buy")}
                    disabled={!trading}
                >
                    Buy
                </button>
                <button
                    type="button"
                    className={`${sellButtonProperties} ${swapType === "sell" ? activeSellButton : ""} ${!trading ? 'cursor-not-allowed' : ''}`}
                    onClick={() => setSwapType("sell")}
                    disabled={!trading}
                >
                    Sell
                </button>
            </div>

            {swapType === "buy" ?
                <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                    You&apos;ll need $SRK to buy {ticker}
                </p>
                :
                <p className="text-sm mb-2">
                    &nbsp;
                </p>
                }

            <div className="relative flex flex-col gap-2 mb-5">
                <div className="flex items-center bg-gray-200 dark:bg-gray-700 dark:placeholder-gray-400 p-2 rounded-lg">
                    <input
                        type="number"
                        title="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Enter amount in ${swapType === "buy" ? "SRK" : ticker}`}
                        className={`flex-1 px-4 py-3 w-full rounded-lg focus:outline-none focus:ring focus:ring-gray bg-transparent ${!trading ? 'cursor-not-allowed' : ''}`}
                        disabled={!trading}
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
                <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setAmount("")}
                            className={`text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-300 transition-colors ${!trading ? 'cursor-not-allowed' : ''}`}
                            disabled={!trading}
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => {
                                const balance =
                                    swapType === "buy"
                                        ? Number.parseFloat(getFormattedEther(toEther(BigInt(srkBalance)), 2).replace(/,/g, ""))
                                        : Number.parseFloat(getFormattedEther(toEther(BigInt(agentBalance)), 2).replace(/,/g, ""))
                                setAmount((balance * 0.25).toFixed(2).toString())
                            }}
                            className={`text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-300 transition-colors ${!trading ? 'cursor-not-allowed' : ''}`}
                            disabled={!trading}
                        >
                            25%
                        </button>
                        <button
                            onClick={() => {
                                const balance =
                                    swapType === "buy"
                                        ? Number.parseFloat(getFormattedEther(toEther(BigInt(srkBalance)), 2).replace(/,/g, ""))
                                        : Number.parseFloat(getFormattedEther(toEther(BigInt(agentBalance)), 2).replace(/,/g, ""))
                                setAmount((balance * 0.5).toFixed(2).toString())
                            }}
                            className={`text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-300 transition-colors ${!trading ? 'cursor-not-allowed' : ''}`}
                            disabled={!trading}
                        >
                            50%
                        </button>
                        <button
                            onClick={() => {
                                const balance =
                                    swapType === "buy"
                                        ? Number.parseFloat(getFormattedEther(toEther(BigInt(srkBalance)), 2).replace(/,/g, ""))
                                        : Number.parseFloat(getFormattedEther(toEther(BigInt(agentBalance)), 2).replace(/,/g, ""))
                                setAmount(balance.toFixed(2).toString())
                            }}
                            className={`text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-300 transition-colors ${!trading ? 'cursor-not-allowed' : ''}`}
                            disabled={!trading}
                        >
                            Max
                        </button>
                    </div>
                    <div className="text-gray-800 dark:text-gray-200">
                        {swapType === "buy" ? `${getFormattedEther(toEther(BigInt(srkBalance)), 2)} SRK` : `${getFormattedEther(toEther(BigInt(agentBalance)), 2)} ${ticker}`}
                    </div>
                </div>
            </div>

            <button type="button" className={`${swapButtonProperties} ${!trading ? 'cursor-not-allowed' : ''}`} onClick={handleSwap} disabled={!trading}>Swap</button>

            {!trading && (
                <div className={'bg-[#00d7b2] mt-4 text-white px-3 py-2 text-center text-[0.9em] flex justify-between items-center'}>
                    <div className={'flex-grow pe-2'}>Liquidity deposited into Camelot. Trading is now disabled.</div>
                    <div>
                        <Link
                            href={'#'}
                            type="button"
                            className={`py-2 bg-white text-black px-5 text-[0.9em] dark:text-[#ffffff] ${buyButtonProperties}}`}
                        >
                            Camelot
                        </Link>
                    </div>
                </div>
            )}

            <WalletConfirmationStatus
                walletConfirmationStatus={walletConfirmationStatus}
                swapType={swapType}
                ticker={ticker}
                setWalletConfirmationStatus={setWalletConfirmationStatus}
                swapTransactionHash={swapTransactionHash}
            />
    </motion.div>
  )
}

export default SwapCard;