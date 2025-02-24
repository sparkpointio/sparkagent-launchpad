"use client";
import { useState } from 'react';

interface SortingProps {
    onSortingChange: (sortType: string, value: string | boolean | null) => void;
}

const AgentSort = ({ onSortingChange }: SortingProps) => {
    const [activeSorting, setActiveSorting] = useState({
        volume: null as "high" | "low" | null,
        marketCap: null as "high" | "low" | null,
        price: null as "high" | "low" | null
    });

    const handleSorting = (type: string) => {
        const newSorting = {
            volume: null as "high" | "low" | null,
            marketCap: null as "high" | "low" | null,
            price: null as "high" | "low" | null
        };

        switch (type) {
            case 'volume':
                newSorting.volume = activeSorting.volume === "high" ? "low" :
                    activeSorting.volume === "low" ? null : "high";
                break;
            case 'marketCap':
                newSorting.marketCap = activeSorting.marketCap === "high" ? "low" :
                    activeSorting.marketCap === "low" ? null : "high";
                break;
            case 'price':
                newSorting.price = activeSorting.price === "high" ? "low" :
                    activeSorting.price === "low" ? null : "high";
                break;
        }

        setActiveSorting(newSorting);
        onSortingChange(type, newSorting[type as keyof typeof newSorting]);
    };

    const dividerProperties = "border-t-2 border-black";
    const filterProperties = "flex text-lg justify-between mx-4 my-2";
    const buttonProperties = "w-full hover:bg-sparkyOrange-200 transition-colors";

    const getButtonClass = (isActive: boolean) => `
    ${buttonProperties}
    ${isActive ? 'bg-sparkyOrange-100 text-black hover:bg-sparkyOrange-200' :
            'hover:bg-gray-100 dark:hover:bg-gray-800'}
`;

    return (
        <div className="bg-white dark:bg-[#1a1d21] dark:text-white h-min border-2 border-black dark:border-gray-700 rounded-2xl shadow-md">
            <h2 className={`${filterProperties} font-bold`}>Sort</h2>
            <hr className={dividerProperties} />
            <button
                className={getButtonClass(!!activeSorting.volume)}
                onClick={() => handleSorting('volume')}
            >
                <p className={filterProperties}>
                    24H Volume
                    {activeSorting.volume && <span>{activeSorting.volume === "high" ? "↑" : "↓"}</span>}
                </p>
            </button>
            <hr className={dividerProperties} />
            <button
                className={getButtonClass(!!activeSorting.marketCap)}
                onClick={() => handleSorting('marketCap')}
            >
                <p className={filterProperties}>
                    Market Cap
                    {activeSorting.marketCap && <span>{activeSorting.marketCap === "high" ? "↑" : "↓"}</span>}
                </p>
            </button>
            <hr className={dividerProperties} />
            <button
                className={`${getButtonClass(!!activeSorting.price)} rounded-b-2xl`}
                onClick={() => handleSorting('price')}
            >
                <p className={filterProperties}>
                    Token Price
                    {activeSorting.price && <span>{activeSorting.price === "high" ? "↑" : "↓"}</span>}
                </p>
            </button>
        </div>
    );
};

export default AgentSort;