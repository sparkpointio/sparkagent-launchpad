import React, { useState } from "react";

interface AgentSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onSearchButtonClick?: () => void;
}

const AgentSearchBar: React.FC<AgentSearchBarProps> = ({
  onSearch,
  placeholder = "Search...",
  onClear,
  onSearchButtonClick
}) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
      if (onSearchButtonClick) {
        onSearchButtonClick();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);

    // If input becomes empty, trigger clear
    if (newValue === "" && onClear) {
      onClear();
    }
  };

  return (
    <div className="flex items-center w-full dark:bg-[#1a1d21]">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1 px-4 py-3 mr-2 lg:mr-4 border border-black dark:border-gray-600 rounded-xl focus:outline-none focus:ring focus:ring-sparkyOrange-300 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
      />
      <button
        className="px-4 lg:px-10 py-3 text-white bg-black dark:bg-gray-700 border border-black dark:border-gray-600 rounded-xl hover:bg-sparkyOrange-600 dark:hover:bg-sparkyOrange-700"
        onClick={handleSearch}
      >
        Search
      </button>
    </div>
  );
};

export default AgentSearchBar;