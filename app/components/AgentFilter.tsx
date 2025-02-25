"use client";
import { useState } from 'react';
interface FilterProps {
    onFilterChange: (filterType: string, value: string | boolean | null) => void;
}

const AgentFilter = ({ onFilterChange }: FilterProps) => {
    const [activeFilters, setActiveFilters] = useState({
        newPairs: false,
        sparked: false,
    });

    const handleFilter = (type: string) => {
        const newFilters = { ...activeFilters };

        switch (type) {
            case 'newPairs':
                newFilters.newPairs = !activeFilters.newPairs;
                break;
            case 'sparked':
                newFilters.sparked = !activeFilters.sparked;
                break;
        }

        setActiveFilters(newFilters);
        onFilterChange(type, newFilters[type as keyof typeof newFilters]);
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
            <h2 className={`${filterProperties} font-bold`}>Filter</h2>
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
        </div>
    );
};

export default AgentFilter;
