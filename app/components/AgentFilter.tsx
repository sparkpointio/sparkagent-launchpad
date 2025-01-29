"use client";
import { useState } from 'react';
interface FilterProps {
    onFilterChange: (filterType: string, value: string | boolean | null) => void;
}

const AgentFilter = ({ onFilterChange }: FilterProps) => {
    const [activeFilters, setActiveFilters] = useState({
        volume: null as "high" | "low" | null,
        marketCap: null as "high" | "low" | null,
        newPairs: false,
        sparked: false,
        price: null as "high" | "low" | null
    });

    const handleFilter = (type: string) => {
        const newFilters = { ...activeFilters };

        switch (type) {
            case 'volume':
                newFilters.volume = activeFilters.volume === "high" ? "low" :
                    activeFilters.volume === "low" ? null : "high";
                break;
            case 'marketCap':
                newFilters.marketCap = activeFilters.marketCap === "high" ? "low" :
                    activeFilters.marketCap === "low" ? null : "high";
                break;
            case 'newPairs':
                newFilters.newPairs = !activeFilters.newPairs;
                break;
            case 'sparked':
                newFilters.sparked = !activeFilters.sparked;
                break;
            case 'price':
                newFilters.price = activeFilters.price === "high" ? "low" :
                    activeFilters.price === "low" ? null : "high";
                break;
        }

        setActiveFilters(newFilters);
        onFilterChange(type, newFilters[type as keyof typeof newFilters]);
    };

    const dividerProperties = "border-t-2 border-black";
    const filterProperties = "flex text-lg justify-between p-4";
    const buttonProperties = "w-full hover:bg-sparkyOrange-200 transition-colors";

    const getButtonClass = (isActive: boolean) => `
    ${buttonProperties}
    ${isActive ? 'bg-sparkyOrange-100 text-black hover:bg-sparkyOrange-200' :
            'hover:bg-gray-100 dark:hover:bg-gray-800'}
`;

    return (
        <div className="bg-white dark:bg-[#1a1d21] dark:text-white h-min border-2 border-black dark:border-gray-700 rounded-2xl shadow-md">
            <h2 className={`${filterProperties} font-bold`}>Filter</h2>
            <hr className={dividerProperties} />
            <button
                className={getButtonClass(!!activeFilters.volume)}
                onClick={() => handleFilter('volume')}
            >
                <p className={filterProperties}>
                    24H Volume
                    {activeFilters.volume && <span>{activeFilters.volume === "high" ? "↑" : "↓"}</span>}
                </p>
            </button>
            <hr className={dividerProperties} />
            <button
                className={getButtonClass(!!activeFilters.marketCap)}
                onClick={() => handleFilter('marketCap')}
            >
                <p className={filterProperties}>
                    Market Cap
                    {activeFilters.marketCap && <span>{activeFilters.marketCap === "high" ? "↑" : "↓"}</span>}
                </p>
            </button>
            <hr className={dividerProperties} />
            <button
                className={getButtonClass(activeFilters.newPairs)}
                onClick={() => handleFilter('newPairs')}
            >
                <p className={filterProperties}>
                    New Pairs
                    {activeFilters.newPairs && <span>✓</span>}
                </p>
            </button>
            <hr className={dividerProperties} />
            <button
                className={getButtonClass(activeFilters.sparked)}
                onClick={() => handleFilter('sparked')}
            >
                <p className={filterProperties}>
                    Sparked
                    {activeFilters.sparked && <span>✓</span>}
                </p>
            </button>
            <hr className={dividerProperties} />
            <button
                className={`${getButtonClass(!!activeFilters.price)} rounded-b-2xl`}
                onClick={() => handleFilter('price')}
            >
                <p className={filterProperties}>
                    Token Price
                    {activeFilters.price && <span>{activeFilters.price === "high" ? "↑" : "↓"}</span>}
                </p>
            </button>
        </div>
    );
};

export default AgentFilter;
