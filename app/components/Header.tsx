'use client';
import Link from 'next/link'
import React, {useEffect, useState} from "react";
import { Menu, X } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from '../lib/utils/style';
import {ConnectButton, darkTheme} from 'thirdweb/react';
import { client } from '../client';
import { selectedChain } from "../lib/chain-thirdweb";
import SparkAgentLogo from './SparkAgentLogo';

const Header = ({ className }: { className?: string }) => {

  const { scrollY } = useScroll();
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const toggleMenu = () => setIsOpen(!isOpen);

  useMotionValueEvent(scrollY, "change", (current) => {
    const prev = scrollY.getPrevious() ?? 0;
    const direction = current - prev;
    if (current < 50 || direction < 0) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  const customButtonStyles = {
    className: "border active:drop-shadow-none px-8 py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] hover:text-[#000] hover:bg-[#D6F2FE] hover:shadow-[0.25rem_0.25rem_#000] active:translate-x-0 active:translate-y-0 active:shadow-none shrink-0 button-1",
  };

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const htmlElement = document.documentElement;

    // Function to check if the .dark class is present
    const checkDarkMode = () => {
      setIsDarkMode(htmlElement.classList.contains("dark"));
    };

    // Initial check
    checkDarkMode();

    // Create a MutationObserver to watch for class changes
    const observer = new MutationObserver(() => {
      checkDarkMode(); // Update state when class changes
    });

    // Observe attribute changes in the `class` attribute
    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect(); // Cleanup observer on unmount
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        id="navbar"
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "bg-white dark:bg-[#1a1d21] dark:text-white fixed top-4 left-0 right-0 z-50 flex mx-4 items-center justify-between p-4 border border-black rounded-[1.7rem] gap-1 flex-col md:flex-row md:mx-12 lg:mx-24 xl:mx-auto px-4 md:px-12 py-4 max-w-screen-lg",
          className
        )}
      >

        {/* Mobile Menu Button */}
        <div className="absolute -top-1 md:hidden flex items-center justify-between w-full px-4 py-2">
          <Link href="/">
            <SparkAgentLogo size={16}/>
            {/*
            <Image
                src={new_sparkpoint_logo_full_light}
                alt="SparkPoint Logo"
                className="md:h-8 h-4 w-fit absolute top-[12px] sparkpoint-logo-light"
            />
            */}
          </Link>
            <button onClick={toggleMenu} className="nav-toggle" aria-label={isOpen ? "Close menu" : "Open menu"}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>

        {!isOpen &&
          (
            <div className='hidden md:flex items-center w-full justify-between'>
              <Link href="/">
                <SparkAgentLogo size={38} />
                {/*
                <Image
                  src={new_sparkpoint_logo_full_light}
                  alt="SparkPoint Logo"
                  className="md:h-8 h-4 w-fit absolute top-[20px] sparkpoint-logo-light"
                />
                */}


              </Link>
              <div className='hidden md:flex items-center gap-6'>
                <nav className="flex gap-6 w-full">
                  <Link href="https://medium.com/theecosystem/sparkpoint-introduces-sparkagent-a-no-code-ai-agent-platform-for-web3-automation-8d8a345352d7" target="_blank" className="nav-item hover:text-gray-900 dark:text-white dark:hover:underline">
                    How it works
                  </Link>
                </nav>
                <ConnectButton
                  connectButton={customButtonStyles}
                  detailsButton={{
                    className: "!w-full justify-center"
                  }}
                  client={client}
                  chain={selectedChain}
                  theme={isDarkMode
                    ? darkTheme({
                        colors: {
                          connectedButtonBg: "#1a1d21",
                        },
                      })
                    : 'light'
                  }
                />
              </div>


              {/*
                <Link href="">
                <button className={buttonVariants({ variant: "outline", size: "md", className: "border active:drop-shadow-none px-8 py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] hover:text-[#000] hover:bg-[#D6F2FE] hover:shadow-[0.25rem_0.25rem_#000] active:translate-x-0 active:translate-y-0 active:shadow-none shrink-0 button-1" })}>
                  Connect Wallet
                </button>
                </Link>
              */}
            </div>
          )
        }

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full md:hidden grid items-center gap-4 mt-2 px-4"
            >
              <nav className="flex items-center justify-center gap-6 flex-col mx-auto">
                <Link href="https://medium.com/theecosystem/sparkpoint-introduces-sparkagent-a-no-code-ai-agent-platform-for-web3-automation-8d8a345352d7" className="nav-item text-gray-600 hover:text-gray-900">
                  How it works
                </Link>
              </nav>
              <ConnectButton
                connectButton={customButtonStyles}
                detailsButton={{
                  className: "!w-full justify-center"
                }}
                client={client}
                chain={selectedChain}
                theme={isDarkMode
                    ? darkTheme({
                      colors: {
                        connectedButtonBg: "#1a1d21",
                      },
                    })
                    : 'light'
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default Header;
