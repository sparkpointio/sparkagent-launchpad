"use client";

import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";

const AgentFilter = ({ onSort, sortConfig }: { onSort: (criterion: string) => void, sortConfig: { criterion: string, ascending: boolean } }) => {
    const dividerProperties = "border-t-2 border-black";
    const filterProperties = "flex text-lg justify-right p-4";
    const buttonProperties = "w-full hover:bg-sparkyOrange-200 transition-all";

    const renderIcons = (criterion: string) => {
        if (sortConfig.criterion === criterion) {
            return sortConfig.ascending ? <IconArrowUp /> : <IconArrowDown />;
        }
        return null;
    };

    return (
        <div className="bg-white h-min border-2 border-black rounded-2xl shadow-md">
            <h2 className={`${filterProperties} font-bold`}>Filter</h2>
            <hr className={dividerProperties} />
            <button className={buttonProperties} onClick={() => onSort("volume")}>
                <div className={`${filterProperties} flex items-center`}>
                    <p className="mr-auto">24H Volume</p>
                    {renderIcons("volume")}
                </div>
            </button>
            <hr className={dividerProperties} />
            <button className={buttonProperties} onClick={() => onSort("marketCap")}>
                <div className={`${filterProperties} flex items-center`}>
                    <p className="mr-auto">Market Cap</p>
                    {renderIcons("marketCap")}
                </div>
            </button>
            <hr className={dividerProperties} />
            <button className={buttonProperties} onClick={() => onSort("datePublished")}>
                <div className={`${filterProperties} flex items-center`}>
                    <p className="mr-auto">New Pairs</p>
                    {renderIcons("datePublished")}
                </div>
            </button>
            <hr className={dividerProperties} />
            <button className={buttonProperties} onClick={() => onSort("sparkingProgress")}>
                <div className={`${filterProperties} flex items-center`}>
                    <p className="mr-auto">Sparked</p>
                    {renderIcons("sparkingProgress")}
                </div>
            </button>
            <hr className={dividerProperties} />
            <button className={`${buttonProperties} rounded-b-2xl`} onClick={() => onSort("tokenPrice")}>
                <div className={`${filterProperties} flex items-center`}>
                    <p className="mr-auto">Token Price</p>
                    {renderIcons("tokenPrice")}
                </div>
            </button>
        </div>
    );
};

export default AgentFilter;
