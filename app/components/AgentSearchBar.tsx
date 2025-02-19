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
    <div className="flex items-center gap-2 sm:gap-4 w-full dark:bg-[#1a1d21]">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full sm:flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-black dark:border-gray-600 rounded-xl focus:outline-none focus:ring focus:ring-sparkyOrange-300 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 text-sm sm:text-base"
      />
      <button
        className="sm:w-auto px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base text-white bg-black dark:bg-gray-700 border border-black dark:border-gray-600 rounded-xl hover:bg-sparkyOrange-600 dark:hover:bg-sparkyOrange-700"
        onClick={handleSearch}
      >
        Search
      </button>
    </div>
  );
};

export default AgentSearchBar;