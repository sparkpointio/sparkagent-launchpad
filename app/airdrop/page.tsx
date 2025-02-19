"use client"

import { useState } from "react"
import { useActiveAccount, useActiveWalletConnectionStatus } from "thirdweb/react"
import { toast } from "sonner"
import {
  IconCopy,
  IconCircleCheck,
} from "@tabler/icons-react";
import Link from 'next/link';
import { sfuel_logo, ownly_logo } from "@/app/lib/assets";
import Image from 'next/image';
import type { StaticImport } from "next/dist/shared/lib/get-img-props";

interface TokenHolding {
  token: string
  balance: string
  isEligible: boolean;
  image: StaticImport | string;
}

export default function Page() {
  // prevent access to the page if the user navigated directly to it
  // if (typeof window !== "undefined") {
  //   // Check if we're in the browser environment
  //   const referrer = document.referrer;
  //   if (!referrer) {
  //     window.history.back();
  //     return null;
  //   }
  // }
  const account = useActiveAccount()
  const connectionStatus = useActiveWalletConnectionStatus()
  const isConnected = connectionStatus === "connected"
  const [isChecking, setIsChecking] = useState(false)
  const [isCopied, setCopied] = useState(false)
  const [holdings, setHoldings] = useState<TokenHolding[]>([
    { token: "$SFUEL", balance: "0", isEligible: false, image: sfuel_logo },
    { token: "$OWN", balance: "0", isEligible: false, image: ownly_logo },
  ])
  const [isClaiming, setIsClaiming] = useState(false)

  async function checkEligibility() {
    if (!account) return
    setIsChecking(true)
    toast.info("Checking eligibility...")

    try {
      setHoldings([
        {
          token: "$SFUEL",
          balance: "99",
          isEligible: true, image: sfuel_logo
        },
        {
          token: "$OWN",
          balance: "99",
          isEligible: true, image: ownly_logo
        }
      ]);
      toast.success("You're eligible for the SRK airdrop!")
    } catch (error) {
      console.error("Error checking eligibility:", error)
      toast.error("Error checking eligibility")
    } finally {
      setIsChecking(false)
    }
  }

  async function handleClaim() {
    setIsClaiming(true);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 !dark:bg-[image:var(--bg-hero-dark)] !bg-[image:var(--bg-hero-light)] bg-cover bg-center bg-no-repeat text-center">
      <div className="flex items-center space-x-4 mb-6">
        <Image src={sfuel_logo} className="w-16 h-16 rounded-full" alt="$SFUEL logo" />
        <Image src={ownly_logo} className="w-16 h-16 rounded-full" alt="$OWN logo" />
      </div>
      <h1 className="font-[family-name:var(--font-rubik)] text-4xl font-bold mb-4 text-gray-800 dark:text-white">COMING SOON</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300">
        Holders of&nbsp;
        <Link className="font-bold hover:text-gray-400 dark:hover:text-gray-100" href="https://bscscan.com/token/0x37ac4d6140e54304d77437a5c11924f61a2d976f" target="_blank" rel="noopener noreferrer">$SFUEL</Link>
        &nbsp;and&nbsp;
        <Link className="font-bold hover:text-gray-400 dark:hover:text-gray-100" href="https://bscscan.com/token/0x7665cb7b0d01df1c9f9b9cc66019f00abd6959ba" target="_blank" rel="noopener noreferrer">$OWN</Link>
        &nbsp;will be allocated with&nbsp;
        <b>$SRK</b>.
        Stay tuned for announcements.
      </p>
    </div>
  )

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 !dark:bg-[image:var(--bg-hero-dark)] !bg-[image:var(--bg-hero-light)] bg-cover bg-center bg-no-repeat">
        <h2 className="mb-4 text-2xl font-bold text-center text-gray-800 dark:text-white">
          Connect your wallet to check eligibility
        </h2>
        <p className="text-center text-gray-800">
          You need to connect your wallet to check if you&apos;re eligible for the $SRK airdrop
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1A1D21] text-gray-900 dark:text-white transition-all duration-300 dark:bg-[image:var(--bg-hero-dark)] bg-[image:var(--bg-hero-light)] bg-cover bg-center bg-no-repeat">
      <div className="container max-w-2xl mx-auto px-4 pt-16 md:pt-32 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 font-[family-name:var(--font-rubik)]">
            $SRK Airdrop
          </h1>
          <p className="text-lg">
            Claim your SRK tokens if you hold $SFUEL and $OWN
          </p>
        </div>

        <div className="space-y-6 backdrop-blur-lg bg-gray-100 dark:bg-white/5 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-transparent dark:shadow-none transition-all duration-10">
          {/* Wallet Section */}
          <div className="bg-gray-200 dark:bg-black/20 rounded-xl p-4 transition-colors duration-10">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm">Connected Wallet</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(account?.address || "")
                  toast.success("Address copied!");
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1000);
                }}
                className="group px-3 py-1.5 text-sm bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors rounded-lg flex items-center gap-2"
                title="Click to copy address"
              >
                <span className="truncate max-w-[150px]">
                  {account?.address}
                </span>
                {isCopied ? (
                  <IconCircleCheck size={16} />
                ) : (
                  <IconCopy size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Token Holdings */}
          <div className="space-y-4">
            {holdings.map((holding) => (
              <div
                key={holding.token}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-200 dark:bg-black/20 transition-colors duration-10"
              >
                <div className="flex items-center gap-4">
                  <Image src={holding.image} className="w-10 h-10 rounded-full" alt={`${holding.token} logo`} />
                  <div>
                    <h3 className="font-medium">{holding.token}</h3>
                    <p className="text-sm">
                      Balance: {holding.balance}
                    </p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center">
                  {holding.isEligible ? (
                    <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z"
                        className="fill-sparkyGreen-500"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12.8536 2.14645C13.0488 2.34171 13.0488 2.65829 12.8536 2.85355L2.85355 12.8536C2.65829 13.0488 2.34171 13.0488 2.14645 12.8536C1.95118 12.6583 1.95118 12.3417 2.14645 12.1464L12.1464 2.14645C12.3417 1.95118 12.6583 1.95118 12.8536 2.14645Z"
                        className="fill-red-500"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                      <path
                        d="M2.14645 2.14645C2.34171 1.95118 2.65829 1.95118 2.85355 2.14645L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L2.14645 2.85355C1.95118 2.65829 1.95118 2.34171 2.14645 2.14645Z"
                        className="fill-red-500"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          {!isChecking && !holdings[0].isEligible && (
            <button
              onClick={checkEligibility}
              className="w-full py-4 px-6 bg-sparkyOrange-500 hover:bg-sparkyOrange-400 active:bg-sparkyOrange-600 text-black font-medium rounded-xl transition-colors duration-10"
            >
              Check Eligibility
            </button>
          )}

          {/* Loading State */}
          {isChecking && (
            <div className="space-y-2">
              <div className="h-1 bg-sparkyOrange-100 dark:bg-sparkyOrange-500/20 rounded-full overflow-hidden transition-colors duration-10">
                <div className="h-full bg-sparkyOrange-500 dark:bg-sparkyOrange-400 animate-progress" />
              </div>
              <p className="text-sm text-center">
                Checking your token holdings...
              </p>
            </div>
          )}

          {/* Claim Button */}
          {holdings.some((h) => h.isEligible) && (
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="w-full py-4 px-6 bg-sparkyGreen-500 hover:bg-sparkyGreen-400 active:bg-sparkyGreen-600 text-black font-medium rounded-xl transition-colors duration-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClaiming ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Claiming...
                </span>
              ) : (
                "Claim SRK"
              )}
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-sm">
          Make sure you have enough ETH in your wallet to cover the transaction fees
        </p>
      </div>
    </div>
  )
}