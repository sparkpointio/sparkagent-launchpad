import { arbitrum, arbitrumSepolia } from "thirdweb/chains";

const getChain = () => {
  const env = process.env.NEXT_PUBLIC_NETWORK;
  return env === "mainnet" ? arbitrum : arbitrumSepolia;
};

export const selectedChain = getChain();