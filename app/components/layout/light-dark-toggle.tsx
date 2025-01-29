'use client';

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

const LightDarkToggle = () => {
  // State to track dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load the initial state from localStorage when the component mounts
  useEffect(() => {
    const darkModeFromStorage = localStorage.getItem("dark") === "true";
    setIsDarkMode(darkModeFromStorage);
    if (darkModeFromStorage) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    localStorage.setItem("dark", newDarkModeState.toString());
    if (newDarkModeState) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  return (
    <div className="fixed bottom-[70px] left-[10px] z-[10]" id="light-dark-toggle-container">
      <input
        type="checkbox"
        className="checkbox"
        id="checkbox"
        onChange={toggleDarkMode}
        checked={isDarkMode}
      />
      <label htmlFor="checkbox" className="checkbox-label">
        <FontAwesomeIcon icon={faMoon} />
        <FontAwesomeIcon icon={faSun} />
        <span className="ball"></span>
      </label>
    </div>
  );
};

export default LightDarkToggle;