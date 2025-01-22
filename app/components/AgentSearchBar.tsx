import React, { useState } from "react";

interface AgentSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const AgentSearchBar: React.FC<AgentSearchBarProps> = ({ onSearch, placeholder = "Search..." }) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="flex items-center w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-3 mr-2 lg:mr-4 border border-black rounded-xl focus:outline-none focus:ring focus:ring-orange-300"
      />
      <button
        className="px-4 lg:px-10 py-3 text-white bg-black border border-black rounded-xl hover:bg-orange-400"
        onClick={handleSearch}
      >
        Search
      </button>
    </div>
  );
};

export default AgentSearchBar;
