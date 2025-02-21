"use client";

import { motion } from "framer-motion";
import { toEther } from "thirdweb";
import { getFormattedEther } from "../lib/utils/formatting";
import { cardProperties } from "../lib/utils/style/customStyles";
import Link from "next/link";

interface SparkingProgressCardProps {
    sparkingProgress: number;
    gradThreshold: bigint;
    trading: boolean;
    contractAddress: string;
}

const SparkingProgressCard: React.FC<SparkingProgressCardProps> = ({
    sparkingProgress,
    gradThreshold,
    trading,
    contractAddress,
}) => {
    const headerProperties = "flex text-3xl justify-right font-bold";
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cardProperties + " space-y-4 lg:space-y-6"}>
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
                            {`, and all liquidity from the bonding curve has been deposited into `}
                            <Link href={'https://app.camelot.exchange/?token1=' + contractAddress + '&token2=' + process.env.NEXT_PUBLIC_SRK_TOKEN + '&swap=v2'} target="_blank" rel="noreferrer" className="text-sparkyOrange-600 font-bold">Camelot</Link>
                            {`.`}
                        </>
                }
            </p>
        </motion.div>
    );
};

export default SparkingProgressCard;