"use client"

import { useState, useEffect, useCallback } from "react"
import {useActiveAccount, useSendTransaction, useActiveWalletConnectionStatus} from "thirdweb/react"
import {getContract, prepareContractCall, readContract, toEther, /*toWei,*/ waitForReceipt} from "thirdweb";
import { toast } from "sonner"
import {
  IconCopy,
  IconCircleCheck,
} from "@tabler/icons-react";
// import Link from 'next/link';
import { sfuel_logo, ownly_logo } from "@/app/lib/assets";
import Image from 'next/image';
import type { StaticImport } from "next/dist/shared/lib/get-img-props";
import {getFormattedEther} from "@/app/lib/utils/formatting";
import {client} from "@/app/client";
import {selectedChain} from "@/app/lib/chain-thirdweb";

interface TokenHolding {
  token: string
  claimAmount: string
  isEligible: boolean;
  isClaimed: boolean,
  image: StaticImport | string;
}

interface Claim {
  index: number;
  address: string;
  amount: string;
  proof: string[];
}

interface MerkleData {
  merkleRoot: string;
  claims: Claim[];
  totalAmount: string;
}

// interface Holder {
//   index: number;
//   address: string;
//   amount: number;
// }

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

  const { mutate: sendTransaction } = useSendTransaction();

  const account = useActiveAccount()
  const connectionStatus = useActiveWalletConnectionStatus()
  const isConnected = connectionStatus === "connected"
  const [isChecking, setIsChecking] = useState(false)
  const [isCopied, setCopied] = useState(false)
  const [holdings, setHoldings] = useState<TokenHolding[]>([
    { token: "$SFUEL", claimAmount: "0", isEligible: false, image: sfuel_logo, isClaimed: false, },
    { token: "$OWN", claimAmount: "0", isEligible: false, image: ownly_logo, isClaimed: false, },
    { token: "OWNLY NFT", claimAmount: "0", isEligible: false, image: ownly_logo, isClaimed: false, },
  ])
  const [isClaiming, setIsClaiming] = useState(false)
  const [ownMerkleData, setOwnMerkleData] = useState<MerkleData | null>(null);
  const [sfuelMerkleData, setSfuelMerkleData] = useState<MerkleData | null>(null);
  const [ownNftMerkleData, setOwnNftMerkleData] = useState<MerkleData | null>(null);
  // const [ownHolders, setOwnHolders] = useState<Holder[]>([]);
  // const [sfuelHolders, setSfuelHolders] = useState<Holder[]>([]);
  // const [ownNftHolders, setOwnNftHolders] = useState<Holder[]>([]);
  const [ownClaims, setOwnClaims] = useState<Claim[]>([]);
  const [sfuelClaims, setSfuelClaims] = useState<Claim[]>([]);
  const [ownNftClaims, setOwnNftClaims] = useState<Claim[]>([]);
  const [isEligibilityChecked, setIsEligibilityChecked] = useState(false);
  const [buttonStatus, setButtonStatus] = useState('Not Checked');

  const idPrefix = "0";

  const sparkSelfClaimContract = getContract({
    client,
    chain: selectedChain,
    address: process.env.NEXT_PUBLIC_SPARK_SELF_CLAIM as string,
  });

  async function checkEligibility() {
    if (!account) return
    setIsChecking(true)
    toast.info("Checking eligibility...")

    // Test Address:
    // account.address = "0x755d3dec8ab27bd8dc8237741689b5f0b1a26f76"; // Address to be tested

    try {
      const data = [
        {
          id: idPrefix + "0",
          claims: sfuelClaims,
          isClaimed: false,
          claimAmount: BigInt(0),
        }, {
          id: idPrefix + "1",
          claims: ownClaims,
          isClaimed: false,
          claimAmount: BigInt(0),
        }, {
          id: idPrefix + "2",
          claims: ownNftClaims,
          isClaimed: false,
          claimAmount: BigInt(0),
        }
      ]

      for(let j = 0; j < data.length; j++) {
        for(let i = 0; i < data[j].claims.length; i++) {
          const claimData = data[j].claims[i];

          data[j].claimAmount += BigInt(claimData.amount);

          if(!data[j].isClaimed) {
            const claimed = await checkIfClaimed(data[j].id, BigInt(claimData.index));

            if (claimed) {
              data[j].isClaimed = true;
            }
          }
        }
      }

      setHoldings([
        {
          token: "$SFUEL",
          claimAmount: (data[0].claimAmount).toString(),
          isEligible: data[0].claimAmount > 0,
          isClaimed: data[0].isClaimed,
          image: sfuel_logo
        },
        {
          token: "$OWN",
          claimAmount: (data[1].claimAmount).toString(),
          isEligible: data[1].claimAmount > 0,
          isClaimed: data[1].isClaimed,
          image: ownly_logo
        },
        {
          token: "OWNLY NFT",
          claimAmount: (data[2].claimAmount).toString(),
          isEligible: data[2].claimAmount > 0,
          isClaimed: data[2].isClaimed,
          image: ownly_logo
        }
      ]);

      if(data[0].claimAmount > 0 || data[1].claimAmount > 0 || data[2].claimAmount > 0) {
        toast.success("You're eligible for the SRK airdrop!")
      } else {
        toast.warning("You're not eligible for the SRK airdrop!")
      }

      setIsEligibilityChecked(true);
    } catch (error) {
      console.error("Error checking eligibility:", error)
      toast.error("Error checking eligibility")
    } finally {
      setIsChecking(false)
    }
  }

  const checkIfClaimed = async (_id: string, _index: bigint) => {
    console.log("checkIfClaimed");
    console.log([_id, _index]);

    return await readContract({
      contract: sparkSelfClaimContract,
      method: "function isClaimed(string _id, uint256 _index) returns (bool)",
      params: [_id, _index],
    });
  };

  async function handleClaim() {
    setIsClaiming(true);

    const data = [
      {
        id: idPrefix + "0",
        claims: sfuelClaims,
      }, {
        id: idPrefix + "1",
        claims: ownClaims,
      }, {
        id: idPrefix + "2",
        claims: ownNftClaims,
      }
    ]

    console.log("data");
    console.log(data);

    const claim = async (_id: string, _index: bigint, _address: string, amount: bigint, proof: string[]) => {
      console.log("claim", [_id, _index, _address, amount, proof]);

      const _proof: readonly `0x${string}`[] = proof as readonly `0x${string}`[];

      return new Promise<void>((resolve, reject) => {
        const claimTx = prepareContractCall({
          contract: sparkSelfClaimContract,
          method: "function claim(string _id, uint256 _index, address _account, uint256 _amount, bytes32[] _merkleProof)",
          params: [_id, _index, _address, amount, _proof],
          value: BigInt(0),
        });

        // Test Address:
        // account.address = "0xB65d3Ae82A75012D2d6F487834534Ee34584B7CD"; // Your actual address

        sendTransaction(claimTx, {
          onError: (error) => {
            console.error("Claim transaction failed:", error);
            reject(error);
          },
          onSuccess: async (tx) => {
            console.log("Transaction Sent, waiting for confirmation:", tx.transactionHash);

            await waitForReceipt({
              client,
              chain: selectedChain,
              transactionHash: tx.transactionHash,
            });

            console.log("Claim transaction successful!");
            console.log("Transaction Hash:", tx.transactionHash);

            await checkEligibility();

            toast.success("You have successfully claimed your airdrop.")

            resolve();
          },
        });
      });
    };

    for(let j = 0; j < data.length; j++) {
      for(let i = 0; i < data[j].claims.length; i++) {
        const claimData = data[j].claims[i];
        const claimed = await checkIfClaimed(data[j].id, BigInt(claimData.index));

        if (!claimed) {
          await claim(data[j].id, BigInt(claimData.index), claimData.address, BigInt(claimData.amount), claimData.proof);
        }
      }
    }

    setIsClaiming(false);
  }

  const findClaimsByAddress = useCallback((data: MerkleData, inputAddress: string): Claim[] => {
    const lowerCaseInput = inputAddress.toLowerCase();
    return data.claims.filter(claim => claim.address.toLowerCase() === lowerCaseInput);
  }, []);

  // const findHoldingsByAddress = useCallback((data: Holder[], inputAddress: string): bigint => {
  //   const lowerCaseInput = inputAddress.toLowerCase();
  //   const holdings = data.filter(holder => holder.address.toLowerCase() === lowerCaseInput);
  //
  //   let total = BigInt(0);
  //
  //   for(let i = 0; i < holdings.length; i++) {
  //     total += BigInt(toWei(holdings[i].amount.toString()));
  //   }
  //
  //   return total;
  // }, []);

  useEffect(() => {
    fetch("/own-merkle.json")
      .then((res) => res.json())
      .then((data) => setOwnMerkleData(data))
      .catch((error) => console.error("Error loading OWN Merkle JSON:", error));
  }, []);

  useEffect(() => {
    fetch("/sfuel-merkle.json")
      .then((res) => res.json())
      .then((data) => setSfuelMerkleData(data))
      .catch((error) => console.error("Error loading SFUEL Merkle JSON:", error));
  }, []);

  useEffect(() => {
    fetch("/own-nft-merkle.json")
        .then((res) => res.json())
        .then((data) => setOwnNftMerkleData(data))
        .catch((error) => console.error("Error loading OWNLY NFT Merkle JSON:", error));
  }, []);

  // useEffect(() => {
  //   fetch("/own-holders.json")
  //       .then((res) => res.json())
  //       .then((data) => setOwnHolders(data))
  //       .catch((error) => console.error("Error loading OWN Holders JSON:", error));
  // }, []);

  // useEffect(() => {
  //   fetch("/sfuel-holders.json")
  //       .then((res) => res.json())
  //       .then((data) => setSfuelHolders(data))
  //       .catch((error) => console.error("Error loading SFUEL Holders JSON:", error));
  // }, []);

  // useEffect(() => {
  //   fetch("/own-nft-holders.json")
  //       .then((res) => res.json())
  //       .then((data) => setOwnNftHolders(data))
  //       .catch((error) => console.error("Error loading OWN NFT Holders JSON:", error));
  // }, []);

  useEffect(() => {
    if (account?.address && ownMerkleData) {
      const address = account.address;
      // Test Address:
      // const address = "0x755d3dec8ab27bd8dc8237741689b5f0b1a26f76"; // address to be tested

      setOwnClaims(findClaimsByAddress(ownMerkleData, address));
    }
  }, [account?.address, ownMerkleData, findClaimsByAddress]);

  useEffect(() => {
    if (account?.address && sfuelMerkleData) {
        const address = account.address;
        // Test Address:
        // const address = "0x755d3dec8ab27bd8dc8237741689b5f0b1a26f76"; // address to be tested

        setSfuelClaims(findClaimsByAddress(sfuelMerkleData, address));
    }
  }, [account?.address, sfuelMerkleData, findClaimsByAddress]);

  useEffect(() => {
    if (account?.address && ownNftMerkleData) {
      const address = account.address;
      // Test Address:
      // const address = "0x755d3dec8ab27bd8dc8237741689b5f0b1a26f76"; // address to be tested

      setOwnNftClaims(findClaimsByAddress(ownNftMerkleData, address));
    }
  }, [account?.address, ownNftMerkleData, findClaimsByAddress]);

  useEffect(() => {
    if(holdings[0].isEligible || holdings[1].isEligible || holdings[2].isEligible) {
      if((holdings[0].isEligible && !holdings[0].isClaimed) || (holdings[1].isEligible && !holdings[1].isClaimed) || (holdings[2].isEligible && !holdings[2].isClaimed)) {
        setButtonStatus("Claim SRK");
      } else {
        setButtonStatus("Claimed");
      }
    } else {
      setButtonStatus("Ineligible");
    }
  }, [holdings]);

  // return (
  //   <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 !dark:bg-[image:var(--bg-hero-dark)] !bg-[image:var(--bg-hero-light)] bg-cover bg-center bg-no-repeat text-center">
  //     <div className="flex items-center space-x-4 mb-6">
  //       <Image src={sfuel_logo} className="w-16 h-16 rounded-full" alt="$SFUEL logo" />
  //       <Image src={ownly_logo} className="w-16 h-16 rounded-full" alt="$OWN logo" />
  //     </div>
  //     <h1 className="font-[family-name:var(--font-rubik)] text-4xl font-bold mb-4 text-gray-800 dark:text-white">COMING SOON</h1>
  //     <p className="text-lg text-gray-700 dark:text-gray-300">
  //       Holders of&nbsp;
  //       <Link className="font-bold hover:text-gray-400 dark:hover:text-gray-100" href="https://bscscan.com/token/0x37ac4d6140e54304d77437a5c11924f61a2d976f" target="_blank" rel="noopener noreferrer">$SFUEL</Link>
  //       &nbsp;and&nbsp;
  //       <Link className="font-bold hover:text-gray-400 dark:hover:text-gray-100" href="https://bscscan.com/token/0x7665cb7b0d01df1c9f9b9cc66019f00abd6959ba" target="_blank" rel="noopener noreferrer">$OWN</Link>
  //       &nbsp;will be allocated with&nbsp;
  //       <b>$SRK</b>.
  //       Stay tuned for announcements.
  //     </p>
  //   </div>
  // )

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 !dark:bg-[image:var(--bg-hero-dark)] !bg-[image:var(--bg-hero-light)] bg-cover bg-center bg-no-repeat">
        <h2 className="mb-4 text-2xl font-bold text-center text-gray-800 dark:text-white">
          Connect your wallet to check eligibility
        </h2>
        <p className="text-center text-gray-800 dark:text-white">
          You need to connect your wallet to check if you&apos;re eligible for the $SRK airdrop
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1A1D21] text-gray-900 dark:text-white transition-all duration-300 dark:bg-[image:var(--bg-hero-dark)] bg-[image:var(--bg-hero-light)] bg-cover bg-center bg-no-repeat">
      <div className="container max-w-2xl mx-auto px-4 pt-16 md:pt-32 pb-12">
        <div className="text-center mt-2 mb-6">
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
                    {
                      isEligibilityChecked &&
                        <p className="text-sm">
                          Claim Amount: {getFormattedEther(toEther(BigInt(holding.claimAmount)), 2)} SRK
                        </p>
                    }
                  </div>
                </div>
                <div className="">
                  {
                    isEligibilityChecked ?
                      holding.isEligible ? (
                        !holding.isClaimed ? (
                          <div className="text-[0.7em] rounded-[6px] bg-sparkyGreen-500 px-2 py-1">Available</div>
                        ) : (
                          <div className="text-[0.7em] rounded-[6px] bg-sparkyOrange-500 px-2 py-1">Claimed</div>
                        )
                      ) : (
                          <div className="text-[0.7em] rounded-[6px] bg-sparkyRed-500 text-white px-2 py-1">Ineligible</div>
                      )
                    : ''
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          {!isChecking && !holdings[0].isEligible && !holdings[1].isEligible && !holdings[2].isEligible && (
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
              className={'w-full py-4 px-6 ' + ((buttonStatus === "Claim SRK") ? 'bg-sparkyGreen-500 hover:bg-sparkyGreen-400 active:bg-sparkyGreen-600' : ((buttonStatus === "Ineligible") ? 'bg-sparkyRed-500 hover:bg-sparkyRed-400 active:bg-sparkyRed-600' : 'bg-sparkyOrange-500 hover:bg-sparkyOrange-400 active:bg-sparkyOrange-600')) + ' text-black font-medium rounded-xl transition-colors duration-10 disabled:opacity-50 disabled:cursor-not-allowed'}
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
                <>{buttonStatus}</>
              )}
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-sm mb-5">
          Make sure you have enough ETH on Arbitrum in your wallet to cover the transaction fees
        </p>
      </div>
    </div>
  )
}