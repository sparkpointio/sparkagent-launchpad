'use client';
import React from 'react';
import { ConnectButton } from 'thirdweb/react';
import { arbitrumSepolia } from "thirdweb/chains";
import { client } from '../client';

const ThirdWebSample = () => {
  return (
    <section>
      <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)] mt-4">
          <li className="mb-2">Test Thirdweb Integration below.</li>
          <li>You will be connected to Arbitrum Sepolia.</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <ConnectButton 
            connectButton={{
              className: "w-full"
            }}
            detailsButton={{
              className: "!w-full justify-center"
            }}
            client={client} 
            chain={arbitrumSepolia} 
          />
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://portal.thirdweb.com/react/v5/getting-started"
            target="_blank"
            rel="noopener noreferrer"
          >
            Thirdweb docs
          </a>
        </div>

    </section>
  )
}

export default ThirdWebSample;