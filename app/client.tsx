import  { createThirdwebClient /*, defineChain, getContract*/ } from "thirdweb";

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;

// @dev - This is the format for a custom chain definition. 
// Replace this with your own chain configuration if you're using a different network.
/*const customChain = defineChain({
    id: 0,
    name: "Blockchain Name",
    nativeCurrency: { name: "Token Name", symbol: "Token Symbol", decimals: 18 },
    icon: {
        url: "https://example.com/url-to-your-chain-icon/chainicon.png",
        width: 500,
        height: 500,
        format: "png"
    },
    rpc: "https://url-to-your-rpc-endpoint.example.com",
    testnet: true,
    blockExplorers: [
      {
        name: "Your Explorer Name",
        url: "https://url-to-your-explorer.example.com",
        apiUrl: "https://url-to-your-explorer-api.example.com/api",
      },
    ],
});*/

if (!clientId) {
  throw new Error("No client ID provided");
}

export const client = createThirdwebClient({
  clientId: clientId,
});

// @dev - Uncomment the following line to use your custom chain definition. This will override the default chains available in thirdweb.
// export const chain = customChain
