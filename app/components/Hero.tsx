'use client';
import React from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { bg_hero_dark } from '../lib/assets';
import { arbitrum } from "thirdweb/chains";
import { client } from '../client';
import { ConnectButton } from 'thirdweb/react';
import { CreateAgentForm } from "../components/CreateAgentForm";
import { buttonVariants } from '../components/variants/button-variants';
import Image from 'next/image';

const Hero = () => {
  const account = useActiveAccount();

  const customButtonStyles = {
      label: "Create Agent",
      className: "!font-[Rubik] !w-[192px] sm:w-48 py-3 !transition-all !duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] !text-white !bg-black hover:bg-black hover:shadow-[0.25rem_0.25rem_#E5E7EB] active:translate-x-0 active:translate-y-0 active:shadow-none !rounded-full",
  };

  return (
    <section className="text-center relative w-full h-[75vh] m:h-[60vh]">
      <link rel="preload" as="image" href={bg_hero_dark.src} />
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <Image
          src={bg_hero_dark.src}
          alt="Hero Background"
          fill
          className="object-cover"
          quality={100}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="absolute top-0 left-0 w-full h-full z-1 bg-mask" />

      <div className='m-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-full relative z-2'>
        <h1 className="text-4xl xl:text-5xl 2xl:text-6xl leading-tight text-center mt-24 text-white">
          No-Code, Create<br/> Co-own AI Agents
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-white text-xl lg:text-2xl">
          Tokenize your ideas into AI agents that collaborate, trade, and earn for you!
        </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              {account ? (
                    <CreateAgentForm>
                      <button className={buttonVariants({ variant: "outline", size: "lg", className: 'w-full sm:w-48 active:drop-shadow-none py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] text-white bg-black hover:bg-black hover:shadow-[0.25rem_0.25rem_#E5E7EB] active:translate-x-0 active:translate-y-0 active:shadow-none button-2' })}>
                        Create Agent
                      </button>
                  </CreateAgentForm>
                  ): (
                  <ConnectButton
                      connectButton={customButtonStyles}
                      client={client}
                      chain={arbitrum}
                      theme="light"
                  />
                  )}
          </div>
      </div>

    </section>
  )
}

export default Hero;