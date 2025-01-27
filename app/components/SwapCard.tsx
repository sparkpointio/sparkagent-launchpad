"use client";

import Image from "next/image";
import { new_sparkpoint_logo } from "../lib/assets";

const SwapCard = () => {
    const headerProperties = "flex text-xl justify-right";
    const buttonProperties = "w-full border-2 border-black rounded-3xl hover:bg-sparkyGreen-500 transition-all p-4"
    return (
        <div className="bg-white h-min border-2 border-black rounded-2xl shadow-md p-6">
            <h2 className={`${headerProperties} font-bold mb-4`}>Swap</h2>
            <div className="flex flex-row gap-4 mb-12">
                <button type="button" className={buttonProperties}> Buy </button>
                <button type="button" className={buttonProperties}> Sell </button>
            </div>
            <div className="relative flex items-center bg-gray-200 p-2 rounded-lg mb-12">
                <input
                    type="text"
                    title="Enter amount"
                    placeholder="Enter amount in SRK"
                    className="flex-1 px-4 py-3 w-full rounded-lg focus:outline-none focus:ring focus:ring-gray bg-transparent"
                />
                <Image
                    src={new_sparkpoint_logo}
                    alt="SparkPoint Logo"
                    className="absolute right-4"
                    width={24}
                    height={24}
                />
            </div>
            <button type="button" className={buttonProperties}> Swap </button>
        </div>
    );
};

export default SwapCard;
