"use client";

const AgentFilter = () => {
    const dividerProperties = "border-t-2 border-black";
    const filterProperties = "flex text-lg justify-right p-4";
    const buttonProperties = "w-full hover:bg-sparkyOrange-200 transition-all";
    return (
        <div className="bg-white h-min border-2 border-black rounded-2xl shadow-md">
            <h2 className={`${filterProperties} font-bold`}>Filter</h2>
            <hr className={dividerProperties} />
            <button className={buttonProperties}><p className={filterProperties}>24H Volume</p></button>
            <hr className={dividerProperties} />
            <button className={buttonProperties}><p className={filterProperties}>Market Cap</p></button>
            <hr className={dividerProperties} />
            <button className={buttonProperties}><p className={filterProperties}>New Pairs</p></button>
            <hr className={dividerProperties} />
            <button className={buttonProperties}><p className={filterProperties}>Graduated</p></button>
            <hr className={dividerProperties} />
            <button className={`${buttonProperties} rounded-b-2xl`}><p className={filterProperties}>Token Price</p></button>
        </div>
    );
};

export default AgentFilter;
