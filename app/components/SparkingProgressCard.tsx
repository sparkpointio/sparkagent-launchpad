"use client";

import { motion } from "framer-motion";
import { toEther } from "thirdweb";
import { getFormattedEther } from "../lib/utils/formatting";

interface SparkingProgressCardProps {
    sparkingProgress: number;
    gradThreshold: bigint;
    ticker: string;
    trading: boolean;
}

const SparkingProgressCard: React.FC<SparkingProgressCardProps> = ({
    sparkingProgress,
    gradThreshold,
    ticker,
    trading,
}) => {
    const headerProperties = "flex text-3xl justify-right font-bold";
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#1a1d21] dark:text-white h-min border-2 border-black rounded-2xl shadow-md p-5 space-y-4 lg:space-y-6">
            <div className="flex items-center">
                <h2 className={`${headerProperties} mr-2 text-[1.6em]`}>Sparking Progress:</h2>
                <span className={`text-[1.6em] ${headerProperties} ${
                    !trading
                        ? "text-sparkyOrange"
                        : sparkingProgress === 100
                            ? "text-sparkyOrange"
                            : "text-sparkyGreen"
                }`}>
                    {!trading ? 100 : sparkingProgress}%
                </span>
            </div>
            <div className="w-full h-4 rounded-full border border-black dark:border-gray-700 overflow-hidden">
                <div
                    className={`h-full rounded-full ${
                        !trading
                            ? "bg-sparkyOrange"
                            : sparkingProgress === 100
                                ? "bg-sparkyOrange"
                                : "bg-sparkyGreen-200"
                    }`}
                    style={{
                        width: `${Math.min(
                            !trading ? 100 : sparkingProgress,
                            100
                        )}%`,
                    }}
                ></div>
            </div>
            <p>
                {trading
                    ?
                        <>
                            {`SRK accumulation is still ongoing until the target of `}
                            <strong>{ getFormattedEther(toEther(gradThreshold), 0) }</strong>
                            {` is reached. At that point, all liquidity from the bonding curve will be deposited into Camelot.`}
                        </>
                    :   <>
                            {`The SRK gathered from purchases has reached the target of `}
                            <strong>{ getFormattedEther(toEther(gradThreshold), 0) }</strong>
                            {`, and all liquidity from the bonding curve has been deposited into Camelot.`}
                        </>
                }
            </p>
        </motion.div>
    );
};

export default SparkingProgressCard;