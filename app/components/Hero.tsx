'use client';
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useActiveAccount } from 'thirdweb/react';
import { ethers5Adapter } from 'thirdweb/adapters/ethers5';
import { bg_hero_dark } from '../lib/assets';
import tokenAbi from '../../contracts/TokenABI.json';
import { arbitrumSepolia } from "thirdweb/chains";
import { client } from '../client';
import { ConnectButton } from 'thirdweb/react';

const Hero = () => {
    const [isDeploying, setIsDeploying] = useState(false);
    const [contractAddress, setContractAddress] = useState<string | null>(null);

    const account = useActiveAccount(); // Hook to get the active account
    const chain = arbitrumSepolia;

    console.log(account);

    const deployTokenContract = async () => {
        try {
            setIsDeploying(true);

            if (!account) {
                alert("Please connect your wallet first.");
                return;
            }

            const signer = await ethers5Adapter.signer.toEthers({
                client,
                chain,
                account,
            });

            // Define ABI and Bytecode
            const { abi, bytecode } = tokenAbi;

            // Create a ContractFactory
            const contractFactory = new ethers.ContractFactory(abi, bytecode, signer);

            // Deploy the contract
            console.log('Deploying contract...');
            const contract = await contractFactory.deploy(
                ethers.utils.parseEther('1000000000')
            );

            console.log('Awaiting confirmation...');
            await contract.deployed();
            console.log(`Contract deployed at: ${contract.address}`);

            // Save the deployed contract address
            setContractAddress(contract.address);
            alert(`Token deployed successfully at ${contract.address}`);
        } catch (error) {
            console.error('Deployment failed:', error);
            alert('Failed to deploy the contract. Check the console for details.');
        } finally {
            setIsDeploying(false);
        }
    };
    const customButtonStyles = {
        label: "Create Agent",
        className: "!font-[Rubik] !w-[192px] sm:w-48 py-3 !transition-all !duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] !text-white !bg-black hover:bg-black hover:shadow-[0.25rem_0.25rem_#E5E7EB] active:translate-x-0 active:translate-y-0 active:shadow-none !rounded-none",
    };

  return (
    <section className="text-center relative w-full h-[60vh] sm:h-[75vh] m:h-[60vh]">
      <div className="bg-cover bg-center bg-no-repeat absolute top-0 left-0 w-full h-full z-0 bg-img-1" style={{ backgroundImage: `url(${bg_hero_dark.src})` }}></div>
      {/* <div className="bg-cover bg-center bg-no-repeat absolute top-0 left-0 w-full h-full z-0 bg-img-2" style={{ backgroundImage: `url(${bg_hero_dark.src})` }}></div> */}
      <div className="absolute top-0 left-0 w-full h-full z-1 bg-mask"></div>

      <div className='m-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-full relative z-2'>
        <h1 className="text-4xl xl:text-5xl 2xl:text-6xl leading-tight text-center mt-24 text-white">
          No-Code, Create<br/> Co-own AI Agents
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-white text-xl lg:text-2xl">
          Tokenize your ideas into AI agents that collaborate, trade, and earn for you!
        </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              {account ? (
                  <button
                      onClick={deployTokenContract}
                      className="w-full sm:w-48 py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] text-white bg-black hover:bg-black hover:shadow-[0.25rem_0.25rem_#E5E7EB] active:translate-x-0 active:translate-y-0 active:shadow-none"
                      disabled={isDeploying}
                  >
                      {isDeploying ? 'Deploying...' : 'Create Agent'}
                  </button>
              ) : (
                  <ConnectButton
                      connectButton={customButtonStyles}
                      client={client}
                      chain={arbitrumSepolia}
                      theme="light"
                  />
              )}
          </div>

          {contractAddress && (
              <p className="mt-4 text-white">
                  Contract deployed at: <span className="text-blue-400">{contractAddress}</span>
              </p>
          )}
      </div>

    </section>
  )
}

export default Hero;