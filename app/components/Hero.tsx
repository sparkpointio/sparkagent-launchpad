'use client';
import React from 'react';
import { buttonVariants } from '../components/variants/button-variants';
import { bg_hero_dark } from '../lib/assets';
import Link from 'next/link';

const Hero = () => {
  return (
    <section className="text-center relative w-full h-[60vh]">
      <div className="bg-cover bg-center bg-no-repeat absolute top-0 left-0 w-full h-full z-0 bg-img-1" style={{ backgroundImage: `url(${bg_hero_dark.src})` }}></div>
      {/* <div className="bg-cover bg-center bg-no-repeat absolute top-0 left-0 w-full h-full z-0 bg-img-2" style={{ backgroundImage: `url(${bg_hero_dark.src})` }}></div> */}
      <div className="absolute top-0 left-0 w-full h-full z-1 bg-mask"></div>

      <div className='m-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-full relative z-2'>
        <h1 className="text-4xl md:text-6xl leading-tight text-center mt-24 text-white">
          No-Code, Create<br/> Co-own AI Agents
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-white md:text-2xl">
          Tokenize your ideas into AI agents that collaborate, trade, and earn for you!
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link className={buttonVariants({ variant: "outline", size: "lg", className: 'w-full sm:w-48 active:drop-shadow-none py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] text-white bg-black hover:bg-black hover:shadow-[0.25rem_0.25rem_#E5E7EB] active:translate-x-0 active:translate-y-0 active:shadow-none button-2' })} href="" target='_blank'>
            Create Agent
          </Link>
        </div>
      </div>

    </section>
  )
}

export default Hero;