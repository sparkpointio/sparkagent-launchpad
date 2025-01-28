"use client";

interface SparkingProgressCardProps {
    sparkingProgress: number;
}


const SparkingProgressCard: React.FC<SparkingProgressCardProps> = ({
    sparkingProgress,
}) => {
    const headerProperties = "flex text-3xl justify-right font-bold";
    return (
        <div className="bg-white h-min border-2 border-black rounded-2xl shadow-md p-5 lg:p-12 space-y-4 lg:space-y-6">
            <div className="flex items-center">
                <h2 className={`${headerProperties} mr-2`}>Sparking Progress:</h2>
                <span className={`${headerProperties} ${
                    sparkingProgress === 100
                        ? "text-sparkyOrange"
                        : "text-sparkyGreen"
                }`}>
                    {sparkingProgress}%
                </span>
            </div>
            <div className="w-full h-4 rounded-full border border-black overflow-hidden">
                <div
                    className={`h-full rounded-full ${
                        sparkingProgress === 100
                            ? "bg-sparkyOrange"
                            : "bg-sparkyGreen-200"
                    }`}
                    style={{
                        width: `${Math.min(
                            sparkingProgress,
                            100
                        )}%`,
                    }}
                ></div>
            </div>
            <p>
                {`You need `}
                <strong>150,000,000 SRK</strong>
                {` before all the liquidity from the bonding curve will be deposited into Uniswap and burnt. Progression increases as the price goes up,`}
            </p>
        </div>
    );
};

export default SparkingProgressCard;
